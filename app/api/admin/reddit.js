module.exports = function(router, log, models) {

	// return a list of all subreddits the users have submitted
	router.get('/subreddit', isAdmin, function(req, res, next) {
		models.Subreddits.findAll({ include: [models.Series]}).success(function(returning) {
			if (returning.length === 0) {
				res.status(404);
				return res.json({
					'type': 'error',
					'code': 404,
					'message': 'no subreddits submitted'
				});
			}

			var imdb_ids = [];

			returning.forEach(function(su) {
				var submitted_subreddit = su.dataValues;

				imdb_ids.push({
					'showid': submitted_subreddit.showid,
					'subreddit': submitted_subreddit.subreddit,
					'showname': submitted_subreddit.Series.name,
					'id': submitted_subreddit.id
				});
			});

			return res.json({
				'type': 'submitted_subreddits',
				'subreddits': imdb_ids
			});
		}).error(function(err) {
			log.error(' GET /api/admin/subreddit DB: ' + err);
			next();
		});
	});

	// accept a submission for a subreddit and delete all the submissions connected to the show
	router.put('/subreddit/:submission_id', isAdmin, function(req, res, next) {
		var submission_id = parseInt(req.params.submission_id);
		if (isNaN(submission_id)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'submission_id must be integer'
			});
		}

		models.Subreddits.find({ where: { 'id': submission_id }, include: [models.Series] }).success(function(returning) {
			// the submission does not exist
			if (returning === null) {
				res.status(404);
				return res.json({
					'type': 'error',
					'code': 404,
					'message': 'submission_id does not exist'
				});
			}

			// some other user beat you to it
			if (returning.dataValues.Series.dataValues.subreddit !== null) {
				res.status(400);
				return res.json({
					'type': 'error',
					'code': 400,
					'message': 'There is already a subreddit for this show submitted'
				});
			}

			models.Series.update({ 'subreddit': returning.dataValues.subreddit},
				{ where: { 'id': returning.dataValues.showid }}).success(function() {

				// delete all submissions for the show
				models.Subreddits.destroy({ where: { 'showid': returning.dataValues.showid }}).success(function() {
					return res.json({
						'type': 'reddit_submission',
						'result': 'accepted'
					});
				}).error(function(err) {
					log.error('PUT /api/admin/subreddit/' + submission_id + ' DB: ' + err);
					next();
				});
			}).error(function(err) {
				log.error('PUT /api/admin/subreddit/' + submission_id + ' DB: ' + err);
				next();
			});
		}).error(function(err) {
			log.error('PUT /api/admin/subreddit/' + submission_id + ' DB: ' + err);
			next();
		});
	});

	// route middleware to make sure a user is an admin
	function isAdmin(req, res, next) {

		// if user is authenticated in the session, carry on 
		if (req.isAuthenticated())
			if (req.user.admin === true) {
				return next();
			}
			else {
				res.status(403);
				return res.json({
					'type': 'error',
					'code': 403,
					'message': 'you do not have access to this resource'
				});
			}
		else {
			// if they aren't redirect them to the home page
			res.status(401);
			return res.json({
				'type': 'error',
				'code': 401,
				'message': 'not logged in'
			});
		}
	}
};