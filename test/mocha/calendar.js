var should 	= require('should');
var request = require('supertest');

var env 	= process.env.NODE_ENV || "test";
process.env.NODE_ENV = env;

var app 	= require('../../server').app;

var models = require('../../models/index');

describe('Calendar', function() {
    describe('logged out', function () {
        it('should return an unauthorized error', function (done) {
            request(app)
                .get('/api/calendar/2014/1')
                .set('Content-Type', 'application/json')
                .expect(401)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('type', 'error');
                    res.body.should.have.property('code', 401);
                    res.body.should.have.property('message', 'not logged in');
                    done();
                });
        });
    });

    describe('logged in', function() {
        var user = null;
        var userid;

        before(function (done) {
            var newUser = {
                'username': 'test',
                'password': 'testtest'
            };

            user = request.agent(app);

            user
                .post('/api/signup')
                .set('Content-Type', 'application/json')
                .send(newUser)
                .expect(200)
                .end(function (err) {
                    models.User.find({ where: { username: 'test' } })
                        .then(function(user_data) {
                            userid = user_data.dataValues.id;
                            done();
                        })
                        .catch(done);
                });
        });

        after(function (done) {
            models.sequelize.query("DELETE FROM \"Users\";").success(function () {
                done();
            }).error(function (err) {
                done(err);
            });
        });

        it('should return a Bad Request error for non integers', function(done) {
            user
                .get('/api/calendar/a/b')
                .set('Content-Type', 'application/json')
                .expect(400)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('type', 'error');
                    res.body.should.have.property('code', 400);
                    res.body.should.have.property('message', 'month and year have to be integers (1 <= month <= 12; 1900 <= year <= 3000)');
                    done();
                });
        });

        it('should return a Bad Request error for month < 0', function(done) {
            user
                .get('/api/calendar/-1/2014')
                .set('Content-Type', 'application/json')
                .expect(400)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('type', 'error');
                    res.body.should.have.property('code', 400);
                    res.body.should.have.property('message', 'month and year have to be integers (1 <= month <= 12; 1900 <= year <= 3000)');
                    done();
                });
        });

        it('should return a Bad Request error for month = 0', function(done) {
            user
                .get('/api/calendar/0/2014')
                .set('Content-Type', 'application/json')
                .expect(400)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('type', 'error');
                    res.body.should.have.property('code', 400);
                    res.body.should.have.property('message', 'month and year have to be integers (1 <= month <= 12; 1900 <= year <= 3000)');
                    done();
                });
        });

        it('should return a Bad Request error for month > 12', function(done) {
            user
                .get('/api/calendar/13/2014')
                .set('Content-Type', 'application/json')
                .expect(400)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('type', 'error');
                    res.body.should.have.property('code', 400);
                    res.body.should.have.property('message', 'month and year have to be integers (1 <= month <= 12; 1900 <= year <= 3000)');
                    done();
                });
        });

        it('should return a Bad Request error for years < 1900', function(done) {
            user
                .get('/api/calendar/12/1899')
                .set('Content-Type', 'application/json')
                .expect(400)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('type', 'error');
                    res.body.should.have.property('code', 400);
                    res.body.should.have.property('message', 'month and year have to be integers (1 <= month <= 12; 1900 <= year <= 3000)');
                    done();
                });
        });

        it('should return a Bad Request error for years > 3000', function(done) {
            user
                .get('/api/calendar/12/3001')
                .set('Content-Type', 'application/json')
                .expect(400)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('type', 'error');
                    res.body.should.have.property('code', 400);
                    res.body.should.have.property('message', 'month and year have to be integers (1 <= month <= 12; 1900 <= year <= 3000)');
                    done();
                });
        });

        it('should return an empty response', function(done) {
            user
                .get('/api/calendar/12/2014')
                .set('Content-Type', 'application/json')
                .expect(200)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('episodes', []);
                    res.body.should.have.property('type', 'episodes');
                    done();
                });
        });

        describe('with data', function() {
            var showid;

            before(function(done) {
                models.Series.create({
                    'showid': 1,
                    'name': 'test',
                    'ended': false
                }).then(function(show) {
                    showid = show.dataValues.id;
                    models.Episodes.create({
                        seriesid: showid,
                        episode: 2,
                        season: 3,
                        title: 'test episode',
                        airdate: '2014-12-31T23:59:59.000Z'
                    }).then(function() {
                        done();
                    }).catch(function(err) {
                        done(err);
                    });
                }).catch(function(err) {
                    done(err);
                });
            });

            after(function(done) {
                models.sequelize.query("DELETE FROM \"TrackShows\";").then(function() {
                    models.sequelize.query("DELETE FROM \"Episodes\";").then(function() {
                        models.sequelize.query("DELETE FROM \"Series\";").then(function () {
                            done();
                        }).catch(function (err) {
                            done(err);
                        });
                    });
                });
            });

            it('should return an empty response', function(done) {
                user
                    .get('/api/calendar/12/2014')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .end(function(err, res) {
                        should.not.exist(err);
                        console.log(res.body);
                        res.body.should.have.property('episodes', []);
                        res.body.should.have.property('type', 'episodes');
                        done();
                    });
            });

            it('should return one episode', function(done) {
                models.TrackShow.create({
                    userid: userid,
                    showid: showid
                }).then(function() {
                    user
                        .get('/api/calendar/12/2014')
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .end(function(err, res) {
                            should.not.exist(err);
                            console.log(res.body);
                            res.body.should.have.property('type', 'episodes');
                            res.body.should.have.property('episodes');
                            res.body.episodes[0].should.have.property('airdate', '2014-12-31T23:59:59.000Z');
                            res.body.episodes[0].should.have.property('episode', 2);
                            res.body.episodes[0].should.have.property('id', showid);
                            res.body.episodes[0].should.have.property('name', 'test');
                            res.body.episodes[0].should.have.property('season', 3);
                            res.body.episodes[0].should.have.property('title', 'test episode');
                            done();
                        });
                }).catch(done);
            });
        });
    });
});