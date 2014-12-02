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

	router.get('/watched/shows', isLoggedIn, function(req, res, next) {
		models.TrackShow.watchedShows(models, req.user.id).success(function(watchedShows) {
			res.json({
				'type': 'shows',
				'shows': watchedShows
			});
		}).error(function(err) {
			log.error('GET /shows/unwatched DB: ' + err);
			next();
		});
	});

	router.get('/unwatched/shows', isLoggedIn, function(req, res, next) {
		models.TrackShow.unwatchedShows(models, req.user.id).success(function(unwatchedShows) {
			if (unwatchedShows.length > 0) {
				models.TrackShow.unwatchedSeasons(models, req.user.id, unwatchedShows[0].id).success(function(unwatchedSeasons) {
					models.TrackShow.unwatchedEpisodes(models, req.user.id, unwatchedShows[0].id, unwatchedSeasons[0].season).success(function(unwatchedEpisodes) {
						return res.json({
							'type': 'shows',
							'shows': unwatchedShows,
							'seasons': unwatchedSeasons,
							'episodes': unwatchedEpisodes
						});
					}).error(function(err) {
						log.error('GET /unwatched/shows unwatchedEpisodes DB: ' + err);
						next();
					});
				}).error(function(err) {
					log.error('GET /unwatched/shows unwatchedSeasons DB: ' + err);
					next();
				});
			}
			else {
				res.status(404);
				res.json({
					'type': 'error',
					'code': 404,
					'message': 'You have no unwatched shows'
				});
			}
		}).error(function(err) {
			log.error('GET /unwatched/shows unwatchedShows DB: ' + err);
			next();
		});
	});

	router.get('/unwatched/shows/:showid/seasons', isLoggedIn, function(req, res, next) {
		var showid = parseInt(req.params.showid);

		if (isNaN(showid)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'showid has to be an integer'
			});
		}

		models.TrackShow.unwatchedSeasons(models, req.user.id, showid).success(function(unwatchedSeasons) {
			if (unwatchedSeasons.length > 0) {
				models.TrackShow.unwatchedEpisodes(models, req.user.id, showid, unwatchedSeasons[0].season).success(function(unwatchedEpisodes) {
					return res.json({
						'type': 'seasons',
						'seasons': unwatchedSeasons,
						'episodes': unwatchedEpisodes
					});
				}).error(function(err) {
					log.error('GET /unwatched/shows unwatchedEpisodes DB: ' + err);
					next();
				});
			}
			else {
				res.status(404);
				return res.json({
					'type': 'error',
					'code': 404,
					'message': 'No unwatched episodes for showid ' + showid
				});
			}
		}).error(function(err) {
			log.error('GET /unwatched/shows unwatchedSeasons DB: ' + err);
			next();
		});
	});

	router.get('/unwatched/shows/:showid/seasons/:season/episodes', isLoggedIn, function(req, res, next) {
		var showid = parseInt(req.params.showid);
		var season = parseInt(req.params.season);

		if (isNaN(showid) || isNaN(season)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'showid and season have to be an integer'
			});
		}

		models.TrackShow.unwatchedEpisodes(models, req.user.id, showid, season).success(function(unwatchedEpisodes) {
			if (unwatchedEpisodes.length > 0) {
				return res.json({
					'type': 'episodes',
					'episodes': unwatchedEpisodes
				});
			}
			else {
				res.status(404);
				return res.json({
					'type': 'error',
					'code': 404,
					'message': 'No unwatched episodes for showid ' + showid + ' and season ' + season
				});
			}
		}).error(function(err) {
			log.error('GET /unwatched/shows unwatchedEpisodes DB: ' + err);
			next();
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