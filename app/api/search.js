var env = process.env.NODE_ENV || "development";
var Promise = require( 'bluebird' );

var tvdb_api_key = require( __dirname + '/../../config/thetvdb.json' ).key;
var tvdbClass = require( __dirname + '/../modules/tvdb' );

var tvdb = new tvdbClass( tvdb_api_key, {
	language: 'en'
} );

// rate limiting
var main_config = require('../../config/main.json')[env];
var ExpressBrute = require('express-brute'),
	RedisStore = require('express-brute-redis');

var store = new RedisStore({
	host: '127.0.0.1',
	port: 6379
});
var bruteforce = new ExpressBrute(store, {
	freeRetries: 20,
	lifetime: 60, // 1 minute
	proxyDepth: main_config.proxyDepth,
	refreshTimeoutOnRequest: false,
	attachResetToRequest: false,
	minWait: 61000,
	maxWait: 61000
});

module.exports = function(router, log, models, _redis) {

	var redis = Promise.promisifyAll( _redis );

	// search for matching shows in local database
	router.get('/search/:show', bruteforce.prevent, function(req, res) {
		var shows = [];

		var search_query = req.params.show.trim();

		var user_id = null;
		if (req.isAuthenticated()) {
			user_id = req.user.id;
		}

		models.Series.search(search_query, user_id).spread(function(query_results) {

			query_results.forEach(function(sh) {
				var show = sh;

				var show_json = {
					'type': 'show',
					'location': 'local',
					'id': show.id,
					'showid': show.thetvdb_id,
					'name': show.name,
					'genre': show.genre,
					'resource': '/api/show/' + show.id
				};

				if (typeof show.tracked !== 'undefined') {
					show_json.tracked = show.tracked;
				}

				shows.push(show_json);
			});

			return res.json({
				'type': 'shows',
				'shows': shows
			});

		}).catch(function(err) {
			log.error('/api/search/'  + req.params.show + ' Error Message: ' + err);
		});
	});

	// search for matching shows in theTVDb api
	router.get( '/search/:show/remote', bruteforce.prevent, function( req, res, next ) {

		var show_name = req.params.show;

		var redis_show_key = 'kTV:search:remote: ' + show_name;

		redis.getAsync( redis_show_key )
			.then( function( redis_shows ) {

				if ( redis_shows ) {
					res.json( {
						type: 'shows',
						shows: JSON.parse( redis_shows )
					});

					throw 'break chain';
				}

				return tvdb.login();

			})
			.then( function() {

				return tvdb.SearchSeries( {
					name: show_name
				});

			})
			.then( function( search_results ) {

				var shows = [];

				search_results.data.forEach( function( show ) {
					shows.push({
						type: 'show',
						location: 'remote',
						name: show.seriesName,
						showid: parseInt( show.id )
					});
				});

				redis.set( redis_show_key, JSON.stringify( shows ) );
				redis.expire( redis_show_key, 86400 );

				res.json({
					'type': 'shows',
					'shows': shows
				});

			})
			.catch( function( error ) {

				if ( error !== 'break chain' ) {
					log.error( 'GET /api/search/' + req.params.show + '/remote error: ' + error );
				}

			});
	});
};