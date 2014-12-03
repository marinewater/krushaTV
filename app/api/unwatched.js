module.exports = function(router, log, models) {
	router.get('/watched/shows', isLoggedIn, function(req, res, next) {
		models.TrackShow.watchedShows(models, req.user.id).success(function(watchedShows) {
			if (watchedShows.length > 0) {
				models.TrackShow.watchedSeasons(models, req.user.id, watchedShows[0].id).success(function(watchedSeasons) {
					models.TrackShow.unwatchedEpisodes(models, req.user.id, watchedShows[0].id, watchedSeasons[0].season).success(function(watchedEpisodes) {
						return res.json({
							'type': 'shows',
							'shows': watchedShows,
							'seasons': watchedSeasons,
							'episodes': watchedEpisodes
						});
					}).error(function(err) {
						log.error('GET /watched/shows watchedEpisodes DB: ' + err);
						next();
					});
				}).error(function(err) {
					log.error('GET /watched/shows watchedSeasons DB: ' + err);
					next();
				});
			}
			else {
				res.status(404);
				res.json({
					'type': 'error',
					'code': 404,
					'message': 'You have no watched shows'
				});
			}
		}).error(function(err) {
			log.error('GET /watched/shows watchedShows DB: ' + err);
			next();
		});
	});

	router.get('/watched/shows/:showid/seasons', isLoggedIn, function(req, res, next) {
		var showid = parseInt(req.params.showid);

		if (isNaN(showid)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'showid has to be an integer'
			});
		}

		models.TrackShow.watchedSeasons(models, req.user.id, showid).success(function(watchedSeasons) {
			if (watchedSeasons.length > 0) {
				models.TrackShow.watchedEpisodes(models, req.user.id, showid, watchedSeasons[0].season).success(function(watchedEpisodes) {
					return res.json({
						'type': 'seasons',
						'seasons': watchedSeasons,
						'episodes': watchedEpisodes
					});
				}).error(function(err) {
					log.error('GET /watched/shows/' + showid + '/seasons watchedEpisodes DB: ' + err);
					next();
				});
			}
			else {
				res.status(404);
				return res.json({
					'type': 'error',
					'code': 404,
					'message': 'No watched episodes for showid ' + showid
				});
			}
		}).error(function(err) {
			log.error('GET /watched/shows/' + showid + '/seasons watchedSeasons DB: ' + err);
			next();
		});
	});

	router.get('/watched/shows/:showid/seasons/:season/episodes', isLoggedIn, function(req, res, next) {
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

		models.TrackShow.watchedEpisodes(models, req.user.id, showid, season).success(function(watchedEpisodes) {
			if (watchedEpisodes.length > 0) {
				return res.json({
					'type': 'episodes',
					'episodes': watchedEpisodes
				});
			}
			else {
				res.status(404);
				return res.json({
					'type': 'error',
					'code': 404,
					'message': 'No watched episodes for showid ' + showid + ' and season ' + season
				});
			}
		}).error(function(err) {
			log.error('GET /watched/shows/' + showid + '/seasons/' + season + '/episodes watchedEpisodes DB: ' + err);
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
					log.error('GET /unwatched/shows/' + showid + '/seasons unwatchedEpisodes DB: ' + err);
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
			log.error('GET /unwatched/shows/' + showid + '/seasons unwatchedSeasons DB: ' + err);
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
			log.error('GET /unwatched/shows/' + showid + '/seasons/' + season + '/episodes unwatchedEpisodes DB: ' + err);
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