var Promise = require( 'bluebird' );

var tvdb_api_key = require( __dirname + '/../../config/thetvdb.json' ).key;
var tvdbClass = require( __dirname + '/../modules/tvdb' );

var tvdb = new tvdbClass( tvdb_api_key, {
	language: 'en'
} );


module.exports = function(router, log, models, get_seasons, redis) {
	function route_get_seasons(req, res, next, selected_season) {
		if (typeof selected_season === 'undefined') {
			selected_season = 1;
		}

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
				'season': selected_season
			});
		}

		if (req.isAuthenticated() !== true) {
			models.Episodes.getSeasons(models, showid)
				.spread(function(seasons) {
					get_seasons.getEpisodes(showid, null, selected_season, function(episodes) {
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
			}).then(function(tracked) {55
				if (tracked !== null) {
					models.Episodes.getSeasonsWatched(models, showid, req.user.id)
						.spread(function(seasons) {
							get_seasons.getEpisodes(showid, req.user.id, selected_season, function(episodes) {
								return return_json(seasons, episodes);
							});
						})
						.catch(log_error);
				}
				else {
					models.Episodes.getSeasons(models, showid)
						.spread(function(seasons) {
							get_seasons.getEpisodes(showid, null, selected_season, function(episodes) {
								return return_json(seasons, episodes);
							});
						})
						.catch(log_error);
				}
			}).catch(log_error);
		}
	}

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
	 * retrieve show from TVDb and send back local show id
	 */
	router.post( '/show', function( req, res, next ) {

		req.checkBody( 'showid', 'Invalid showid' ).notEmpty().isInt();

		var errors = req.validationErrors();

		if ( errors ) {
			res.status(400);
			return res.json({
				type: 'error',
				code: 400,
				errors: errors
			});
		}

		var local_show_id;

		models.Series.findOne( {
			where:
			{
				showid: req.body.showid
			}
		})
			.then( function( show ) {

				// show is already in database

				if ( show ) {
					res.json({
						type: 'show',
						id: id,
						resource: '/api/show/' + show.id
					});

					throw 'break chain';
				}

				return tvdb.login();

			})
			.then( function() {

				var get_show_info = [];

				get_show_info.push( tvdb.Series( req.body.showid )
					.then( function( series_data ) {

						// get all necessary info and immediatly create database entry for series

						return models.Series.findOrCreate({
							where: {
								thetvdb_id: req.body.showid
							},
							defaults:  {
								name: series_data.data.seriesName,
								genre: series_data.data.genre.join( ',' ),
								ended: series_data.data.status !== 'Continuing',
								imdbid: series_data.data.imdbId ? series_data.data.imdbId : null
							}
						});

					}));

				/**
				 * recursive function to get all pages of episode results
				 * @param {number} show_id
				 * @param {Array} [episodes]
				 * @param {number} [page]
				 * @returns {Promise}
				 */
				function getAllEpisodes( show_id, episodes, page ) {

					if( Object.prototype.toString.call( episodes ) !== '[object Array]' ) {
						episodes = [];
					}

					return tvdb.SeriesEpisodes( show_id, page )
						.then( function( episode_data ) {

							var combined_episodes = episodes.concat( episode_data.data );

							if ( episode_data.links.next ) {

								return getAllEpisodes( show_id, combined_episodes, episode_data.links.next );

							}
							else {

								return combined_episodes;

							}
						});

				}

				get_show_info.push( getAllEpisodes( req.body.showid ) );

				return Promise.all( get_show_info );

			})
			.spread( function( show_instance, episodes ) {

				// bulk create all episodes

				var new_episodes = [];
				local_show_id = show_instance[0].id;

				episodes.forEach( function( episode ) {

					new_episodes.push({
						season: parseInt( episode.airedSeason ),
						episode: parseInt( episode.airedEpisodeNumber ),
						title: episode.episodeName,
						airdate: episode.firstAired ? new Date( episode.firstAired ) : null,
						seriesid: show_instance[0].id,
						thetvdb_id: parseInt( episode.id ),
						overview: episode.overview
					});

				});

				return models.Episodes.bulkCreate( new_episodes );

			})
			.then( function() {

				// clear cache for homepage and return data

				redis.del('kTV:today');

				return res.json({
					type: 'show',
					id: local_show_id,
					resource: '/api/show/' + local_show_id
				});

			})
			.catch( function( error ) {

				log.error( error );

				res.status( 500 );
				return res.json({
					type: 'error',
					code: 500,
					message: 'Internal Server Error'
				});

			});

	});

	/**
	 * get seasons for show
	 */
	router.get('/show/:showid/season', route_get_seasons);

	/**
	 * get seasons for show
	 */
	router.get('/show/:showid/season/:season', function(req, res, next) {
		/**
		 * season number
		 * @type {Number}
		 */
		var season = parseInt(req.params.season);

		if (isNaN(season)) {
			res.status(400);
			return res.json({
				'type': 'error',
				'code': 400,
				'message': 'season must be integer'
			});
		}
		route_get_seasons(req, res, next, season);
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