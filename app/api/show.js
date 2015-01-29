var request = require('request');
var libxmljs = require("libxmljs");
var tvrage = require('../../config/tvrage.json');

module.exports = function(router, log, models, get_seasons, redis) {
	/**
	 * get show info from local database
	 */
	router.get('/show/:showid', function(req, res, next) {
		/**
		 * local show id
		 * @type {Number}
		 */
		var showid = parseInt(req.params.showid);
		if (isNaN(showid)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'showid must be integer'
			});
		}
		else {
			models.Series.find({ where: { 'id': showid } }).then(function(data) {
				/**
				 * json result
				 * @type {{type: string, location: string, id: number, showid: number, name: string, genre: string, subreddit: string, resource: string, imdbid: (string|null), imdb_submitted: Boolean}}
				 */
				var result = {
					'type': 'show',
					'location': 'local',
					'id': data.id,
					'showid': data.showid,
					'name': data.name,
					'genre': data.genre,
					'subreddit': data.subreddit,
					'resource': '/api/show/' + data.id,
					'imdbid': data.imdbid
				};

				if (req.isAuthenticated()) {
					models.TrackShow.find({ where: { 'userid': req.user.id, 'showid': showid }}).then(function(returning) {
						result.tracked = !!returning;

						if (data.subreddit === null) {
							models.Subreddits.findOne({ where: { 'userid': req.user.id, 'showid': data.id }}).then(function(returning) {
								if (returning !== null) {
									result.subreddit = false;
								}
								models.Imdb.findOne({ where: { 'userid': req.user.id, 'showid': data.id }}).then(function(returning) {
									if (returning !== null) {
										result.imdb_submitted = false;
									}
									return res.json(result);
								}).catch(function(err) {
									log.error('GET /api/show/' + showid + ' DB: ' + err);
									next('error');
								});
							}).catch(function(err) {
								log.error('GET /api/show/' + showid + ' DB: ' + err);
								next('error');
							});
						}
						else {
							return res.json(result);
						}
					});
				}
				else {
					return res.json(result);
				}
			})
			.catch(function(err) {
				log.error('GET /api/show/' + req.params.showid + ' DB: ' + err);
				res.status(404);
				res.json({
					'type': 'error',
					'code': 404,
					'message': 'id not found'
				});
			});
		}
	});

	/**
	 * retrieve show from tvrage and send back local show id
	 */
	router.post('/show', function(req, res, next) {
		/**
		 * tvrage show id
		 * @type {Number}
		 */
		var body_showid = parseInt(req.body.showid, 10);

		if (isNaN(body_showid)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'showid must be integer'
			});
		}
		else {
			models.Series.find({ where: { 'showid': body_showid } }).catch(function() {
			}).then(function(returning) {
				if (returning !== null) {
					// show is already in database, return id
					id = returning.dataValues.id;
					res.json({
						'type': 'show',
						'id': id,
						'resource': '/api/show/' + id
					});
				}
				else {
					// show is not in database, request from TVRage and insert into database
					request(tvrage.baseurl + 'feeds/full_show_info.php?key=' + tvrage.key + '&sid=' + body_showid, function(error, response, body) {
						if (!error && response.statusCode == 200) {
							var xml = libxmljs.parseXmlString(body);


							var show = xml.get('/Show');

							// put show info into the database and return info
							/**
							 * show's genres
							 * @type {string}
							 */
							var genres = '';
							show.find('./genres/genre').forEach(function(genre) {
								genres += genre.text() + ', ';
							});

							/**
							 * tvrage show id
							 * @type {Number}
							 */
							var show_id = parseInt(show.get('./showid').text());

							models.Series.findOrCreate({
								where: { 'showid': show_id },
								defaults:  {
									'name': show.get('./name').text(),
									'genre': genres.substring(0, genres.length - 2),
									'ended': (show.get('./status').text() === 'Ended' || show.get('./status').text() === 'Canceled')
								}
							}).then(function(returning) {
								/**
								 * local show id
								 * @type {Number}
								 */
								var id = returning[0].dataValues.id;

								// add episodes
								/**
								 * list of episodes for specified show
								 * @type {Array}
								 */
								var episodes = [];

								show.find('./Episodelist/Season').forEach(function(s) {
									/**
									 * season number
									 * @type {Number}
									 */
									var season_nr = parseInt(s.attr('no').value());

									s.find('./episode').forEach(function(e) {
										/**
										 * date the episode was first aired
										 * @type {null | string}
										 */
										var airdate = e.get('./airdate').text() === '0000-00-00' ? null : e.get('./airdate').text();
										
										episodes.push({
											'season': parseInt(season_nr),
											'episode': parseInt(e.get('./seasonnum').text()),
											'title': e.get('./title').text(),
											'airdate': airdate,
											'seriesid': id
										});

									});
								});

								models.Episodes.bulkCreate(episodes).then(function() {
									redis.del('kTV:today');
									res.json({
										'type': 'show',
										'id': id,
										'resource': '/api/show/' + id
									});
								}).catch(function(err) {
										log.error('/api/show DB (Episode): ' + err);
								});
							}).catch(function(err) {
								log.error('/api/show DB (Series): ' + err);
							});
						}
						else {
							// TVRage returned error, log it
							res.status(400);
							/**
							 * error string for logging, because we failed to retrieve data from tvrage
							 * @type {string}
							 */
							var log_error = '/api/show';

							if (typeof response !== 'undefined')
								log_error += ' HTTP-Code: ' + response.statusCode;
							if (typeof error !== 'undefined') {
								console.log(error);
								if (error === 'Error: read ECONNRESET') {
									res.status(503);
									return res.json({
										'type': 'error',
										'code': 503,
										'message': 'We cannot retrieve this show at the moment, please try again later.'
									});
								}
								else {
									log_error += ' error: ' + error;
								}
							}

							log.error(log_error);
							return next('error');
						}
					});
				}
			});
		}
	});

	/**
	 * get seasons for show
	 */
	router.get('/show/:showid/season', function(req, res, next) {
		function log_error(err) {
			log.error('GET /show/' + showid + '/season DB: ' + err);
			next();
		}

		/**
		 * local show id
		 * @type {Number}
		 */
		var showid = parseInt(req.params.showid);

		if (isNaN(showid)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'showid must be integer'
			});
		}

		function return_json(seasons, episodes) {
			for (var season in seasons) {
				if (seasons.hasOwnProperty(season)) {
					seasons[season].episode_count = parseInt(seasons[season].episode_count);

					if (seasons[season].hasOwnProperty('watched_count')) {
						seasons[season].watched_count = parseInt(seasons[season].watched_count);
					}
				}
			}
			return res.json({
				'type': 'seasons',
				'seasons': seasons,
				'episodes': episodes,
				'season': seasons[0].season
			});
		}

		if (req.isAuthenticated() !== true) {
			models.Episodes.getSeasons(models, showid)
				.then(function(seasons) {
					get_seasons.getEpisodes(showid, null, seasons[0].season, function(episodes) {
						return return_json(seasons, episodes);
					});
				})
				.catch(log_error);
		}
		else {
			models.TrackShow.findOne({
				where: {
					userid: req.user.id,
					showid: showid
				},
				attributes: ['id']
			}).then(function(tracked) {
				if (tracked !== null) {
					models.Episodes.getSeasonsWatched(models, showid, req.user.id)
						.then(function(seasons) {
							get_seasons.getEpisodes(showid, req.user.id, seasons[0].season, function(episodes) {
								return return_json(seasons, episodes);
							});
						})
						.catch(log_error);
				}
				else {
					models.Episodes.getSeasons(models, showid)
						.then(function(seasons) {
							get_seasons.getEpisodes(showid, null, seasons[0].season, function(episodes) {
								return return_json(seasons, episodes);
							});
						})
						.catch(log_error);
				}
			}).catch(log_error);
		}
	});

	/**
	 * get episodes for show
	 */
	router.get('/show/:showid/season/:season/episodes', function(req, res, next) {
		/**
		 * local show id
		 * @type {Number}
		 */
		var showid = parseInt(req.params.showid);

		/**
		 * season number
		 * @type {Number}
		 */
		var season = parseInt(req.params.season);

		function log_error(err) {
			log.error('GET /show/' + showid + '/season/' + season + '/episodes DB: ' + err);
			next();
		}


		if (isNaN(showid) || isNaN(season)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'showid and season must be integer'
			});
		}
		else {
			function return_json(season, episodes) {
				if (episodes === null) {
					res.status(404);
					return res.json({
						'type': 'error',
						'code': 404,
						'message': 'No episodes found.'
					});
				}
				else {
					return res.json({
						'type': 'episodes',
						'episodes': episodes,
						'season': season
					});
				}
			}

			if (req.isAuthenticated() !== true) {
				get_seasons.getEpisodes(showid, null, season, function(episodes) {
					return return_json(season, episodes);
				});
			}
			else {
				models.TrackShow.findOne({
					where: {
						userid: req.user.id,
						showid: showid
					},
					attributes: ['id']
				}).then(function(tracked) {
					if (tracked !== null) {
						get_seasons.getEpisodes(showid, req.user.id, season, function(episodes) {
							return return_json(season, episodes);
						});
					}
					else {
						get_seasons.getEpisodes(showid, null, season, function(episodes) {
							return return_json(season, episodes);
						});
					}
				}).catch(log_error);
			}
		}
	});
};