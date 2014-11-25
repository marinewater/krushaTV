module.exports = function(router, log, models) {
	// add show to list of tracked shows
	router.post('/track', isLoggedIn, function(req, res, next) {
		showid = parseInt(req.body.showid);
		if (isNaN(showid)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'showid must be integer'
			});
		}

		models.Series.find({ where: { 'id': showid } }).success(function(returning) {
			if (returning) {
				models.TrackShow.findOrCreate({
					where: {
						'userid': req.user.id,
						'showid': showid
					},
					defaults: {
						'userid': req.user.id,
						'showid': showid
					}
				}).success(function(returning) {
					res.status(201);
					return res.json({
						'type': 'track',
						'showid': returning[0].dataValues.showid
					});
				}).error(function(err) {
					log.error('/api/track DB:' + err);
					res.status(400);
					return res.json({
						'type': 'error',
						'code': 400,
						'message': 'Bad Request'
					});
				});
			}
			else {
				res.status(404);
				return res.json({
					'type': 'error',
					'code': 404,
					'message': 'Show id not found'
				});
			}
		}).error(function(err) {
			log.error('/api/track DB:' + err);
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'Bad Request'
			});
		});
	});

	router.get('/track', isLoggedIn, function(req, res, next) {
		models.TrackShow.findAll({
			where: {
				'userid': req.user.id
			},
			include: [models.Series]
		}).success(function(returning) {
			if(returning.length !== 0) {
				shows = [];
				idlist = [];

				returning.forEach(function(show) {
					idlist.push(show.Series.id);
				});

				// return a list with the amount of seasons for each season id
				models.Episodes.countSeasons(idlist).success(function(season_counts) {

					models.WatchedEpisodes.countWachtedEpisodes(models, req.user.id, idlist).success(function(watched_counts) {

						returning.forEach(function(show) {
							var season_count = 0;
							var episode_count = 0;
							var watched_count = 0;

							season_counts.forEach(function(sc) {
								if (sc.seriesid === show.Series.id) {
									season_count = sc.season_count;
									episode_count = sc.episode_count;
								}
							});

							watched_counts.forEach(function(wc) {
								if (wc.seriesid === show.Series.id) {
									watched_count = wc.count;
								}
							})
							shows.push({
								'name': show.Series.name,
								'id': show.Series.id,
								'resource': '/api/show/' + show.Series.id,
								'season_count': parseInt(season_count),
								'episode_count': parseInt(episode_count),
								'watched_count': parseInt(watched_count),
								'ended': show.Series.ended
							});
						});

						return res.json({
							'type':  'tracked',
							'shows': shows
						});
						
					});
				}).error(function(err) {
					log.error('GET /api/track DB: ' + err);
					return next();
				});
			}
			else {
				res.status(404);
				return res.json({
					'type': 'error',
					'code': 404,
					'message': 'User does not track any shows'
				});
			}
		});
	});

	router.delete('/track/:showid', isLoggedIn, function(req, res, next) {
		showid = parseInt(req.params.showid);
		if (isNaN(showid)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'showid must be integer'
			});
		}

		models.TrackShow.destroy({ where: {
			'showid': showid,
			'userid': req.user.id
		}}).success(function(delete_count) {
			if (delete_count > 0) {
				return res.json({
					'type': 'delete',
					'success': true
				});
			}
			else {
				res.status(404);
				return res.json({
					'type': 'error',
					'code': 404,
					'msg': 'show was not tracked anyway'
				});
			}
		}).error(function(err) {
			log.err('DELETE /track/' + req.params.showid + ' userid: ' + req.user.id + ' DB: ' + err);
		});

	});

	router.delete('/watched/episode/:episodeid', isLoggedIn, function(req, res, next) {
		episodeid = parseInt(req.params.episodeid);
		if (isNaN(episodeid)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'episodeid must be integer'
			});
		}

		models.WatchedEpisodes.destroy({ where: { 'userid': req.user.id, 'episodeid': episodeid } }).success(function() {
			return res.json({
				'type': 'watched',
				'medium': 'episode'
			});
		}).error(function(err) {
			log.error('DELETE /watched/episode/' + episodeid + " DB: " + err);

			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'Bad Request'
			});
		});
	});

	router.post('/watched/episode', isLoggedIn, function(req, res, next) {
		episodeid = parseInt(req.body.episodeid);
		if (isNaN(episodeid)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'episodeid must be integer'
			});
		}

		models.WatchedEpisodes.findOrCreate({ where: { 'userid': req.user.id, 'episodeid': episodeid} }).success(function() {
			res.status(201);
			return res.json({
				'type': 'watched',
				'medium': 'episode'
			});
		}).error(function(err) {
			log.error('POST /watched/episode/ DB: ' + err);

			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'episodeid does not exist'
			});
		});
	});

	router.post('/watched/season', isLoggedIn, function(req, res, next) {
		showid = parseInt(req.body.showid);
		season_nr = parseInt(req.body.season_nr);
		if (isNaN(showid) || isNaN(season_nr)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'showid and season_nr must be integer'
			});
		}

		models.WatchedEpisodes.seasonWatched(models, req.user.id, season_nr, showid).success(function() {
			res.status(201);
			return res.json({
				'type': 'watched',
				'medium': 'season'
			});
		}).error(function(err) {
			log.error('POST /watched/season/ DB: ' + err);

			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'Bad Request'
			});
		});

	});

	router.post('/watched/show', isLoggedIn, function(req, res, next) {
		showid = parseInt(req.body.showid);
		if (isNaN(showid)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'showid must be integer'
			});
		}

		models.WatchedEpisodes.showWatched(models, req.user.id, showid).success(function() {
			res.status(201);
			return res.json({
				'type': 'watched',
				'medium': 'show'
			});
		}).error(function(err) {
			log.error('POST /watched/show/ DB: ' + err);

			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'Bad Request'
			});
		});

	});

	router.delete('/watched/show/:showid', isLoggedIn, function(req, res, next) {
		showid = parseInt(req.params.showid);
		if (isNaN(showid)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'showid must be integer'
			});
		}

		models.WatchedEpisodes.deleteWatchedShow(models, req.user.id, showid).success(function() {
			return res.json({
				'type': 'unwatched',
				'medium': 'season'
			});
		}).error(function(err) {
			log.error('DELETE /watched/show/' + showid + " DB: " + err);

			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'Bad Request'
			});
		});
	});

	router.delete('/watched/season/:showid/:seasonnr', isLoggedIn, function(req, res, next) {
		showid = parseInt(req.params.showid);
		seasonnr = parseInt(req.params.seasonnr);
		if (isNaN(showid) || isNaN(seasonnr)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'seasonnr and showid must be integer'
			});
		}

		models.WatchedEpisodes.deleteWatchedSeason(models, req.user.id, seasonnr, showid).success(function() {
			return res.json({
				'type': 'unwatched',
				'medium': 'season'
			});
		}).error(function(err) {
			log.error('DELETE /watched/season/' + showid + '/' + seasonnr + " DB: " + err);

			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'Bad Request'
			});
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