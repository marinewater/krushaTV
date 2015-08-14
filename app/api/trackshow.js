module.exports = function(router, log, models, user) {
	// add show to list of tracked shows
	router.post('/track', user.isLoggedIn, function(req, res, next) {
		showid = parseInt(req.body.showid);
		if (isNaN(showid)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'showid must be integer'
			});
		}

		models.Series.find({ where: { 'id': showid } }).then(function(returning) {
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
				}).then(function(returning) {
					res.status(201);
					return res.json({
						'type': 'track',
						'showid': returning[0].dataValues.showid
					});
				}).catch(function(err) {
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
		}).catch(function(err) {
			log.error('/api/track DB:' + err);
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'Bad Request'
			});
		});
	});

	router.get('/track', user.isLoggedIn, function(req, res, next) {
		models.TrackShow.findAll({
			where: {
				'userid': req.user.id
			},
			include: [models.Series]
		}).then(function(returning) {
			if(returning.length !== 0) {
				var shows = [];
				var id_list = [];

				returning.forEach(function(show) {
					id_list.push(show.Series.id);
				});

				// return a list with the amount of seasons for each season id
				models.Episodes.countSeasons(id_list).spread(function(season_counts) {

					models.WatchedEpisodes.countWachtedEpisodes(models, req.user.id, id_list).then(function(watched_counts) {

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
							});
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
				}).catch(function(err) {
					log.error('GET /api/track DB', err);
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

	router.delete('/track/:showid', user.isLoggedIn, function(req, res, next) {
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
		}}).then(function(delete_count) {
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
		}).catch(function(err) {
			log.err('DELETE /track/' + req.params.showid + ' userid: ' + req.user.id + ' DB: ' + err);
		});

	});

	router.delete('/watched/episode/:episodeid', user.isLoggedIn, function(req, res, next) {
		episodeid = parseInt(req.params.episodeid);
		if (isNaN(episodeid)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'episodeid must be integer'
			});
		}

		models.WatchedEpisodes.destroy({ where: { 'userid': req.user.id, 'episodeid': episodeid } }).then(function() {
			return res.json({
				'type': 'watched',
				'medium': 'episode'
			});
		}).catch(function(err) {
			log.error('DELETE /watched/episode/' + episodeid + " DB: " + err);

			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'Bad Request'
			});
		});
	});

	router.post('/watched/episode', user.isLoggedIn, function(req, res, next) {
		episodeid = parseInt(req.body.episodeid);
		if (isNaN(episodeid)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'episodeid must be integer'
			});
		}

		models.WatchedEpisodes.findOrCreate({ where: { 'userid': req.user.id, 'episodeid': episodeid} }).then(function() {
			res.status(201);
			return res.json({
				'type': 'watched',
				'medium': 'episode'
			});
		}).catch(function(err) {
			log.error('POST /watched/episode/ DB: ' + err);

			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'episodeid does not exist'
			});
		});
	});

	router.post('/watched/season', user.isLoggedIn, function(req, res, next) {
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

		models.WatchedEpisodes.seasonWatched(models, req.user.id, season_nr, showid).then(function() {
			res.status(201);
			return res.json({
				'type': 'watched',
				'medium': 'season'
			});
		}).catch(function(err) {
			log.error('POST /watched/season/ DB: ' + err);

			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'Bad Request'
			});
		});

	});

	router.post('/watched/show', user.isLoggedIn, function(req, res, next) {
		showid = parseInt(req.body.showid);
		if (isNaN(showid)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'showid must be integer'
			});
		}

		models.WatchedEpisodes.showWatched(models, req.user.id, showid).then(function() {
			res.status(201);
			return res.json({
				'type': 'watched',
				'medium': 'show'
			});
		}).catch(function(err) {
			log.error('POST /watched/show/ DB', err);

			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'Bad Request'
			});
		});

	});

	router.delete('/watched/show/:showid', user.isLoggedIn, function(req, res, next) {
		showid = parseInt(req.params.showid);
		if (isNaN(showid)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'showid must be integer'
			});
		}

		models.WatchedEpisodes.deleteWatchedShow(models, req.user.id, showid).then(function() {
			return res.json({
				'type': 'unwatched',
				'medium': 'season'
			});
		}).catch(function(err) {
			log.error('DELETE /watched/show/' + showid + " DB: " + err);

			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'Bad Request'
			});
		});
	});

	router.delete('/watched/season/:showid/:seasonnr', user.isLoggedIn, function(req, res, next) {
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

		models.WatchedEpisodes.deleteWatchedSeason(models, req.user.id, seasonnr, showid).then(function() {
			return res.json({
				'type': 'unwatched',
				'medium': 'season'
			});
		}).catch(function(err) {
			log.error('DELETE /watched/season/' + showid + '/' + seasonnr + " DB: " + err);

			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'Bad Request'
			});
		});
	});
};