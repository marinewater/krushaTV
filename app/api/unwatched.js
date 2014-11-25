module.exports = function(router, log, models) {
	router.get('/unwatched', isLoggedIn, function(req, res, next) {
		models.TrackShow.unwatchedEpisodes(models, req.user.id).success(function(returning) {
			res.json({
				'type': 'unwatched',
				'episodes': returning
			});
		}).error(function(err) {
			log.error("GET /api/unwatched DB: " + err);
			return next('error');
		});
	});

	router.get('/watched', isLoggedIn, function(req, res, next) {
		models.TrackShow.watchedEpisodes(models, req.user.id).success(function(returning) {
			res.json({
				'type': 'watched',
				'episodes': returning
			});
		}).error(function(err) {
			log.error("GET /api/watched DB: " + err);
			return next('error');
		});
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