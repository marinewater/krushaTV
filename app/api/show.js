var request = require('request');
var libxmljs = require("libxmljs");
var tvrage = require('../../config/tvrage.json');

module.exports = function(router, log, models) {
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
			models.Series.find({ where: { 'id': showid } }).success(function(data) {
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
					models.TrackShow.find({ where: { 'userid': req.user.id, 'showid': showid }}).success(function(returning) {
						result.tracked = !!returning;

						if (data.subreddit === null) {
							models.Subreddits.findOne({ where: { 'userid': req.user.id, 'showid': data.id }}).success(function(returning) {
								if (returning !== null) {
									result.subreddit = false;
								}
								models.Imdb.findOne({ where: { 'userid': req.user.id, 'showid': data.id }}).success(function(returning) {
									if (returning !== null) {
										result.imdb_submitted = false;
									}
									return res.json(result);
								}).error(function(err) {
									log.error('GET /api/show/' + showid + ' DB: ' + err);
									next('error');
								});
							}).error(function(err) {
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
			.error(function(err) {
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
			models.Series.find({ where: { 'showid': body_showid } }).error(function() {
			}).success(function(returning) {
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
							}).success(function(returning) {
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

								models.Episodes.bulkCreate(episodes).success(function() {
									res.json({
										'type': 'show',
										'id': id,
										'resource': '/api/show/' + id
									});
								}).error(function(err) {
										log.error('/api/show DB (Episode): ' + err);
								});
							}).error(function(err) {
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

							if (typeof response !== undefined)
								log_error += ' HTTP-Code: ' + response.statusCode;
							if (typeof error !== undefined)
								log_error += ' error: ' + error;

							log.error(log_error);
							return next('error');
						}
					});
				}
			});
		}
	});

	/**
	 * get episodes for show
	 */
	router.get('/show/:showid/episodes', function(req, res) {
		/**
		 * local show id
		 * @type {Number}
		 */
		var showid = parseInt(req.params.showid);
		if (isNaN(showid)) {
			res.status(400);
			res.json({
				'type': 'error',
				'code': 400,
				'message': 'showid must be integer'
			});
		}
		else {
			/**
			 * @type {{where: {seriesid: Number}, include: Array}}
			 */
			var query = {
				where: { seriesid: showid }
			};
			if (req.isAuthenticated()) {
				query.include = [models.WatchedEpisodes]
			}

			models.Episodes.findAll(query).success(function(returning) {
				/**
				 * Key: Season number, Value, list of episodes for season
				 * @type {Object.<number, {episodes: Array.<{title: string, episode: number, airdate: string, watched: boolean, id: number}>}>}
				 */
				var seasons = {};

				returning.forEach(function(ep) {
					var episode = ep.dataValues;

					if (req.isAuthenticated()) {
						var watched = false;

						if (episode.WatchedEpisodes.length > 0) {
							watched = true;
						}
					}

					if (!(episode.season in seasons)) {
						seasons[episode.season] = {
							'episodes': []
						};
					}

					if (req.isAuthenticated()) {
						seasons[episode.season].episodes.push({
							'title': episode.title,
							'episode': episode.episode,
							'airdate': episode.airdate,
							'watched': watched,
							'id': episode.id
						});
					}
					else {
						seasons[episode.season].episodes.push({
							'title': episode.title,
							'episode': episode.episode,
							'airdate': episode.airdate,
							'id': episode.id
						});
					}
				});

				return res.json({
					'type': 'episodes',
					'resource': '/api/show/' + showid + '/episodes',
					'seasons': seasons
				});
			});
		}
	});
};