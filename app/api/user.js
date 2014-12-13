var request = require('request');
var url = require('url');
var recaptcha_config = require('../../config/recaptcha');
var env = process.env.NODE_ENV || "development";

module.exports = function(router, log, models, passport) {
	// api endpoint to handle logins
	router.post('/login', function(req, res, next) {
		// reject if user is already loggedin
		if (req.isAuthenticated()) {
			res.status(403);
			return res.json({
				'type': 'error',
				'code': 403,
				'message': 'user is already loggedin'
			});
		}

		passport.authenticate('local-login', function(err, user, info) {
			if (err) {
				log.error('GET /api/login Login: ' + err);
				return next();
			}

			if (!user) {
				res.status(401);
				return res.json({
					'type': 'error',
					'code': 401,
					'message': 'User and password combination not found.',
					'login': 1
				});
			}
			req.logIn(user, function(err) {

				if (err) {
					log.error('GET /api/login Login: ' + err);
					return next();
				}
				return res.json({
					'type': 'authenticated',
					'user': user.username
				});
			});
		})(req, res, next);
	});

	/**
	 * logs the user out of a session
	 */
	router.get('/logout', function(req, res, next) {
		req.logout();
		return res.json({
			'type': 'logout',
			'success': true
		});
	});

	/**
	 * registers a new user
	 */
	router.post('/signup', function(req, res, next) {
		if (req.isAuthenticated()) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'Logged in users are not allowed to register!'
			});
		}
		else {
			var url_obj = {
				protocol: 'https',
				host: 'www.google.com',
				pathname: 'recaptcha/api/siteverify',
				query: {
					secret: recaptcha_config.secret,
					response: req.body.captcha
				}
			};

			if (env === 'production') {
				url_obj.query.remoteip = req.ip;
			}

			// check captcha
			request(url.format(url_obj), function(error, response, body) {
				if (!error && response.statusCode == 200 && !!JSON.parse(body).success) {

					// sign up
					passport.authenticate('local-signup', function(err, user, info) {
						if (err) { return next(err); }
						if (!user) {
							switch (info) {
								case 'pw_too_short':
									res.status(400);
									return res.json({
										'type': 'error',
										'code': 400,
										'message': 'The provided password is too short.',
										'error': 'pw_too_short'
									});
									break;

								case 'user_exists':
									res.status(409);
									return res.json({
										'type': 'error',
										'code': 409,
										'message': 'There is already a user with that name.',
										'error': 'user_exists'
									});
									break;

								default:
									res.status(400);
									return res.json({
										'type': 'error',
										'code': 400,
										'message': 'No credentials provided'
									});
							}
						}

						req.logIn(user, function(err) {
							if (err) { return next(err); }
							return res.json({
								'type': 'authenticated',
								'user': user.username
							});
						});
					})(req, res, next);
				}
				else {
					res.status(409);
					return res.json({
						'type': 'error',
						'code': 409,
						'message': 'Captcha failed!'
					});
				}
			});
		}
	});

	/**
	 * return the users profile as json, includeing the user's name, a total count of watched episodes and tracked shows and settings
	 */
	router.get('/profile', isLoggedIn, function(req, res, next) {
		models.WatchedEpisodes.count({
			where: { 'userid': req.user.id }
		}).success(function(total_watched_episodes) {
			models.TrackShow.count({
				where: { 'userid': req.user.id }
			}).success(function(total_watched_shows) {
				return res.json({
					'type': 'profile',
					'user': req.user.username,
					'total_episodes': total_watched_episodes,
					'total_shows': total_watched_shows,
					'admin': req.user.admin === true,
					'settings': {
						'episode_offset': {
							'days': typeof req.user.episode_offset.days !== 'undefined' ? req.user.episode_offset.days : 0,
							'hours': typeof req.user.episode_offset.hours !== 'undefined' ? req.user.episode_offset.hours : 0
						},
						'date_format': req.user.date_format
					}
				});
			}).error(function(err) {
				log.error('GET /api/profile DB: ' + err);
				return next();
			});
		}).error(function(err) {
			log.error('GET /api/profile DB: ' + err);
			return next();
		});
	});

	/**
	 * sets setting "episode offset" for a user: the user wants to be notified of a new episode ahead or behind of time
	 * (the episode airs on the 13. of march, but the wants it to show up at the 14., the offset will be (+)1 day
	 */
	router.put('/profile/settings/episode-offset', isLoggedIn, function(req, res, next) {
		/**
		 * episode offset days
		 * @type {Number}
		 */
		var days = parseInt(req.body.offset.days);

		/**
		 * episode offset hours
		 * @type {Number}
		 */
		var hours = parseInt(req.body.offset.hours);

		if (isNaN(days) || isNaN(hours)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'offset.days and offset.hours must be integer'
			});
		}

		models.User.update({
				'episode_offset': days.toString(10) + ' days ' + hours.toString(10) + 'hours'
			},
			{
				where: {
					'id': req.user.id
				}
			}).success(function() {
				return res.json({
					'type': 'settings',
					'success': true
				});
			}).error(function(err) {
				log.error('PUT /profile/settings/episode-offset DB: ' + err);
				res.status(400);
				return res.json({
					'type': 'error',
					'code': 400,
					'message': 'Bad Request'
				});
			});
	});

	/**
	 * sets how dates are displayed for a user
	 */
	router.put('/profile/settings/date-format', isLoggedIn, function(req, res, next) {
		/**
		 * date format RegExp
		 * @type {RegExp}
		 */
		var date_format_regex = /^((d|M){2}|y{4})[./-]((d|M){2}|y{4})[./-]((d|M){2}|y{4})$/;

		/**
		 * date format
		 * @type {String}
		 */
		var date_format = req.body.date_format;

		if (typeof date_format === 'undefined' || !date_format.match(date_format_regex)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'date_format is not a valid date format'
			});
		}

		models.User.update({
				'date_format': date_format
			},
			{
				where: {
					'id': req.user.id
				}
			}).success(function() {
				return res.json({
					'type': 'settings',
					'success': true
				});
			}).error(function(err) {
				log.error('PUT /profile/settings/date-format DB: ' + err);
				res.status(400);
				return res.json({
					'type': 'error',
					'code': 400,
					'message': 'Bad Request'
				});
			});
	});

	/**
	 * returns username if user logged in or http code 401 if not
	 */
	router.get('/status', function(req, res) {
		if (req.isAuthenticated()) {
			return res.json({
				'type': 'status',
				'auth': true,
				'user': req.user.username,
				'dateFormat': req.user.date_format
			});
		}
		else {
			res.status(401);
			return res.json({
				'type': 'error',
				'code': 401,
				'message': 'not logged in',
				'login': false
			});
		}
	});


	/**
	 * route middleware to make sure a user is logged in
	 * @param req
	 * @param res
	 * @param next
	 * @returns {*}
	 */
	function isLoggedIn(req, res, next) {

		// if user is authenticated in the session, carry on 
		if (req.isAuthenticated())
			return next();

		// if they aren't redirect them to the home page
		res.status(401);
		return res.json({
			'type': 'error',
			'code': 401,
			'message': 'not logged in'
		});
	}
};