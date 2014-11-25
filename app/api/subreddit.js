module.exports = function(router, log, models) {
	// add show to list of tracked shows
	router.post('/subreddit', isLoggedIn, function(req, res, next) {
		var showid = parseInt(req.body.showid);
		if (isNaN(showid)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'showid must be integer'
			});
		}

		if (!('subreddit' in req.body)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'no subreddit supplied'
			});
		}

		var reddit_regex = /^(?:http(?:s)?:\/\/)?(?:www\.)?(?:reddit\.com)?(\/r\/\w+)(?:[.?&/].*)?$/i;

		var match = req.body.subreddit.match(reddit_regex);

		if (!match) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'subreddit is not a valid reddit url'
			});
		}

		models.Series.findOne({ where: {'id': showid } }).success(function(returning) {
			if (returning !== null) {
				if (returning.dataValues.subreddit === null) {
					models.Subreddits.findOrCreate({
						where: { 'userid': req.user.id, 'showid': showid},
						defaults: { 'userid': req.user.id, 'showid': showid, 'subreddit': match[1]}
					}).success(function(affected) {
						if (affected[1]) {
							res.status(201);
							return res.json({
								'type': 'subreddit',
								'success': true
							});
						}
						else {
							res.status(400);
							return res.json({
								'type': 'error',
								'code': 400,
								'message': 'user has already submitted a subreddit for this show'
							});
						}
					}).error(function() {
						res.status(400);
						return res.json({
							'type': 'error',
							'code': 400,
							'message': 'Bad Request'
						});
					});
				}
				else {
					res.status(400);
					return res.json({
						'type': 'error',
						'code': 400,
						'message': 'show already has a subreddit'
					});
				}
			}
			else {
				res.status(404);
				return res.json({
					'type': 'error',
					'code': 404,
					'message': 'showid does not exist'
				});
			}
		}).error(function(err) {
			log.error('POST /api/subreddit DB:' + err);
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'Bad Request'
			});
		})
	});

	// route middleware to make sure a user is logged in
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