var should 	= require('should');
var request = require('supertest');

var env 	= process.env.NODE_ENV || "test";
process.env.NODE_ENV = env;

var app 	= require('../server').app;

var Sequelize = require("sequelize");
var config    = require(__dirname + '/../config/config.json')[env];
var sequelize = new Sequelize(config.database, config.username, config.password, config);

describe('User', function() {
	before(function(done) {
		sequelize.query("DELETE FROM \"Users\";").success(function() {
			done();
		}).error(function(err) {
			done(err);
		});
	});

	afterEach(function(done) {
		sequelize.query("DELETE FROM \"Users\";").success(function() {
			done();
		}).error(function(err) {
			done(err);
		});
	});

	describe('Signup', function() {
		it('should signup a user', function(done) {
			var newUser = {
				'username': 'test',
				'password': 'testtest'
			};

			request(app)
				.post('/api/signup')
				.set('Content-Type', 'application/json')
				.send(newUser)
				.expect(200)
				.end(function(err, res) {
					should.not.exist(err);
					res.body.should.have.property('type', 'authenticated');
					res.body.should.have.property('user', 'test');

					sequelize.query("SELECT * FROM \"Users\" u WHERE u.username = 'test';").success(function(ret) {
						if (ret !== null)
							return done();
						done("user does not exist");
					}).error(function(err) {
						done(err);
					});
				});
		});

		it('should fail to signup two users with the same name', function(done) {
			var newUser = {
				'username': 'test',
				'password': 'testtest'
			};
			var newUser2 = {
				'username': 'test',
				'password': 'failtest'
			};

			request(app)
				.post('/api/signup')
				.set('Content-Type', 'application/json')
				.send(newUser)
				.expect(200)
				.end(function(err, res) {
					should.not.exist(err);

					request(app)
					.post('/api/signup')
					.set('Content-Type', 'application/json')
					.send(newUser2)
					.expect(409)
					.end(function(err, res) {
						should.not.exist(err);
						res.body.should.have.property('error', 'user_exists');
						done();
					});
				});
		});

		it('should fail to signup a user with a passsword length shorter than six characters', function(done) {
			var newUser = {
				'username': 'test',
				'password': 'test'
			};

			request(app)
				.post('/api/signup')
				.set('Content-Type', 'application/json')
				.send(newUser)
				.expect(400)
				.end(function(err, res) {
					should.not.exist(err);
					res.body.should.have.property('error', 'pw_too_short');
					done();
				});
		});

		it('should fail to signup a user without a username', function(done) {
			var newUser = {
				'password': 'testtest'
			};

			request(app)
				.post('/api/signup')
				.set('Content-Type', 'application/json')
				.send(newUser)
				.expect(400)
				.end(function(err, res) {
					should.not.exist(err);
					res.body.should.have.property('message', 'No credentials provided');
					done();
				});
		});

		it('should fail to signup a user without a password', function(done) {
			var newUser = {
				'username': 'test'
			};

			request(app)
				.post('/api/signup')
				.set('Content-Type', 'application/json')
				.send(newUser)
				.expect(400)
				.end(function(err, res) {
					should.not.exist(err);
					res.body.should.have.property('message', 'No credentials provided');
					done();
				});
		});

		it('should fail to signup a already loggedin user', function(done) {
			var user = request.agent(app);

			var newUser = {
				'username': 'test',
				'password': 'testtest'
			};

			var newUser2 = {
				'username': 'test2',
				'password': 'testtest2'
			};

			user
				.post('/api/signup')
				.set('Content-Type', 'application/json')
				.send(newUser)
				.expect(200)
				.end(function(err, res) {
					should.not.exist(err);
					user
						.post('/api/signup')
						.set('Content-Type', 'application/json')
						.send(newUser)
						.expect(400)
						.end(function(err2, res2) {
							should.not.exist(err2);
							res2.body.should.have.property('message', 'Logged in users are not allowed to register!');
							done();
						});
				});
		});
	});

	describe('Login', function() {
		it('should login a user', function(done) {
			var newUser = {
				'username': 'test',
				'password': 'testtest'
			};

			request(app)
				.post('/api/signup')
				.set('Content-Type', 'application/json')
				.send(newUser)
				.expect(200)
				.end(function() {
					var user = request.agent(app);

					user
						.post('/api/login')
						.set('Content-Type', 'application/json')
						.send(newUser)
						.expect(200)
						.end(function(err, res) {
							should.not.exist(err);
							res.body.should.have.property('type', 'authenticated');
							res.body.should.have.property('user', 'test');
							res.headers.should.have.property('set-cookie');
							done();
						});
				});
		});

		it('should fail to login an already logged in user', function(done) {
			var newUser = {
				'username': 'test',
				'password': 'testtest'
			};

			var user = request.agent(app);

			user
				.post('/api/signup')
				.set('Content-Type', 'application/json')
				.send(newUser)
				.expect(200)
				.end(function() {
					user
						.post('/api/login')
						.set('Content-Type', 'application/json')
						.send(newUser)
						.expect(403)
						.end(function(err, res) {
							should.not.exist(err);
							res.body.should.have.property('message', 'user is already loggedin');
							done();
						});
				});
		});

		it('should fail to login an not existing user', function(done) {
			var newUser = {
				'username': 'test',
				'password': 'testtest'
			};

			request(app)
				.post('/api/login')
				.set('Content-Type', 'application/json')
				.send(newUser)
				.expect(401)
				.end(function(err, res) {
					should.not.exist(err);
					res.body.should.have.property('message', 'User and password combination not found.');
					res.body.should.have.property('login', 1);
					done();
				});

		});

		it('should fail to login a user with a wrong password', function(done) {
			var newUser = {
				'username': 'test',
				'password': 'testtest'
			};

			var wrongPasswort = {
				'username': 'test',
				'password': 'testtest2'
			};

			request(app)
				.post('/api/signup')
				.set('Content-Type', 'application/json')
				.send(newUser)
				.expect(200)
				.end(function() {
					var user = request.agent(app);

					user
						.post('/api/login')
						.set('Content-Type', 'application/json')
						.send(wrongPasswort)
						.expect(401)
						.end(function(err, res) {
							should.not.exist(err);
							res.body.should.have.property('message', 'User and password combination not found.');
							res.body.should.have.property('login', 1);
							done();
						});
				});
		});
	});

	describe('Status', function() {
		it('should send an error if user is not logged in', function(done) {
			request(app)
				.get('/api/status')
				.expect(401)
				.end(function(err, res) {
					should.not.exist(err);
					res.body.should.have.property('login', false);
					res.body.should.have.property('message', 'not logged in');
					done();
				});
		});

		it('should return that the user is logged in', function(done) {
			var user = request.agent(app);

			var newUser = {
				'username': 'test',
				'password': 'testtest2'
			};

			user
				.post('/api/signup')
				.set('Content-Type', 'application/json')
				.send(newUser)
				.expect(200)
				.end(function(err, res) {
					should.not.exist(err);

					user
						.get('/api/status')
						.expect(200)
						.end(function(err2, res2) {
							should.not.exist(err2);
							res2.body.should.have.property('auth', true);
							res2.body.should.have.property('user', 'test');
							done();
						});
				});
		});
	});

	describe('Logout', function() {
		it('should log out a logged in user', function(done) {
			var user = request.agent(app);

			var newUser = {
				'username': 'test',
				'password': 'testtest2'
			};

			user
				.post('/api/signup')
				.set('Content-Type', 'application/json')
				.send(newUser)
				.expect(200)
				.end(function(err, res) {
					should.not.exist(err);

					user
						.get('/api/logout')
						.expect(200)
						.end(function(err2, res2) {
							should.not.exist(err2);
							res2.body.should.have.property('success', true);
							res2.body.should.have.property('type', 'logout');

							user
								.get('/api/status')
								.expect(401)
								.end(function(err, res) {
									should.not.exist(err);
									res.body.should.have.property('login', false);
									res.body.should.have.property('message', 'not logged in');
									done();
								});
						});
				});
		});
	});

	describe('Profile', function() {
		it('should fail to load a profile if no user is logged in', function(done) {
			request(app)
				.get('/api/profile')
				.expect(401)
				.end(function(err, res) {
					should.not.exist(err);
					res.body.should.have.property('message', 'not logged in');
					done();
				});
		});

		it('should load a profile if the user is logged in', function(done) {
			var newUser = {
				'username': 'test',
				'password': 'testtest'
			};

			var user = request.agent(app);
			user
				.post('/api/signup')
				.set('Content-Type', 'application/json')
				.send(newUser)
				.expect(200)
				.end(function() {
					user
						.get('/api/profile')
						.set('Content-Type', 'application/json')
						.expect(200)
						.end(function(err, res) {
							should.not.exist(err);
							res.body.should.have.property('type', 'profile');
							res.body.should.have.property('user', 'test');
							res.body.should.have.property('total_episodes', 0);
							res.body.should.have.property('total_shows', 0);
							res.body.should.have.property('settings');
							res.body.settings.should.have.property('episode_offset');
							res.body.settings.episode_offset.should.have.property('days', 0);
							res.body.settings.episode_offset.should.have.property('hours', 0);
							res.body.settings.should.have.property('date_format', 'yyyy-MM-dd');
							done();
						});
				});
		});

		describe('Settings', function() {
			describe('Episode Offset', function() {
				it('should set the episode offset setting', function(done) {
					var newUser = {
						'username': 'test',
						'password': 'testtest'
					};

					var user = request.agent(app);
					user
						.post('/api/signup')
						.set('Content-Type', 'application/json')
						.send(newUser)
						.expect(200)
						.end(function() {
							user
								.put('/api/profile/settings/episode-offset')
								.set('Content-Type', 'application/json')
								.send({
									'offset': {
										'days': -2,
										'hours': 1
									}
								})
								.expect(200)
								.end(function(err, res) {
									should.not.exist(err);
									res.body.should.have.property('type', 'settings');
									res.body.should.have.property('success', true);

									sequelize.query('SELECT u.episode_offset FROM "Users" u WHERE u.username = \'' + newUser.username + '\' LIMIT 1;')
										.success(function(db_user) {
											db_user[0].should.have.property('episode_offset');
											db_user[0].episode_offset.should.have.property('days', -2);
											db_user[0].episode_offset.should.have.property('hours', 1);
											done();
										}).error(function(err) {
											done(err);
										});
								});
						});
				});

				it('should fail to set episode offset setting if user is not loggedin', function(done) {
					request(app)
						.put('/api/profile/settings/episode-offset')
						.expect(401)
						.end(function(err, res) {
							should.not.exist(err);
							res.body.should.have.property('message', 'not logged in');
							done();
						});
				});

				it('should fail to set a string as episode offset setting', function(done) {
					var newUser = {
						'username': 'test',
						'password': 'testtest'
					};

					var user = request.agent(app);
					user
						.post('/api/signup')
						.set('Content-Type', 'application/json')
						.send(newUser)
						.expect(200)
						.end(function() {
							user
								.put('/api/profile/settings/episode-offset')
								.set('Content-Type', 'application/json')
								.send({
									'offset': {
										'days': "abc",
										'hours': "def"
									}
								})
								.expect(400)
								.end(function(err, res) {
									should.not.exist(err);
									res.body.should.have.property('type', 'error');
									res.body.should.have.property('code', 400);
									res.body.should.have.property('message', 'offset.days and offset.hours must be integer');
									done();
								});
						});
				});
			});

			describe('Date Format', function() {
				it('should fail to set the date format if user is not loggedin', function(done) {
					request(app)
						.put('/api/profile/settings/date-format')
						.expect(401)
						.end(function(err, res) {
							should.not.exist(err);
							res.body.should.have.property('message', 'not logged in');
							done();
						});
				});

				it('should set the date format', function(done) {
					var newUser = {
						'username': 'test',
						'password': 'testtest'
					};

					var date_format = 'yyyy-MM-dd';

					var user = request.agent(app);
					user
						.post('/api/signup')
						.set('Content-Type', 'application/json')
						.send(newUser)
						.expect(200)
						.end(function() {
							user
								.put('/api/profile/settings/date-format')
								.set('Content-Type', 'application/json')
								.send({
									'date_format': date_format
								})
								.expect(200)
								.end(function(err, res) {
									should.not.exist(err);
									res.body.should.have.property('type', 'settings');
									res.body.should.have.property('success', true);

									sequelize.query('SELECT u.date_format FROM "Users" u WHERE u.username = \'' + newUser.username + '\' LIMIT 1;')
										.success(function(db_user) {
											db_user[0].should.have.property('date_format', date_format);
											done();
										}).error(function(err) {
											done(err);
										});
								});
						});
				});

				it('should fail to set a random string as date format', function(done) {
					var newUser = {
						'username': 'test',
						'password': 'testtest'
					};

					var user = request.agent(app);
					user
						.post('/api/signup')
						.set('Content-Type', 'application/json')
						.send(newUser)
						.expect(200)
						.end(function() {
							user
								.put('/api/profile/settings/date-format')
								.set('Content-Type', 'application/json')
								.send({
									'date_format': "abc"
								})
								.expect(400)
								.end(function(err, res) {
									should.not.exist(err);
									res.body.should.have.property('type', 'error');
									res.body.should.have.property('code', 400);
									res.body.should.have.property('message', 'date_format is not a valid date format');
									done();
								});
						});
				});
			});
		});
	});
});