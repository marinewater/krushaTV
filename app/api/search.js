var env = process.env.NODE_ENV || "development";
var request = require('request');
var libxmljs = require("libxmljs");
var tvrage = require('../../config/tvrage.json');

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

module.exports = function(router, log, models, redis) {
	// search for matching shows in local database
	router.get('/search/:show', bruteforce.prevent, function(req, res) {
		var shows = [];

		var search_query = req.params.show.trim();

		var user_id = null;
		if (req.isAuthenticated()) {
			user_id = req.user.id;
		}

		models.Series.search(search_query, user_id).success(function(query_results) {

			query_results.forEach(function(sh) {
				var show = sh.dataValues;

				var show_json = {
					'type': 'show',
					'location': 'local',
					'id': show.id,
					'showid': show.showid,
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

		}).error(function(err) {
			log.error('/api/search/'  + req.params.show + ' DB: ' + err);
		});
	});

	// search for matching shows in tvrage api
	router.get('/search/:show/remote', bruteforce.prevent, function(req, res, next) {
		var redis_show_key = 'kTV:search:remote: ' + req.params.show;
		redis.get(redis_show_key, function (err, redis_shows) {
			if (err) {
				log.error('GET /api/search/' + req.params.show + '/remote redis: ' + err);
			}
			else if (redis_shows) {
				return res.json({
					'type': 'shows',
					'shows': JSON.parse(redis_shows)
				});
			}
			request(tvrage.baseurl + 'myfeeds/search.php?key=' + tvrage.key + '&show=' + req.params.show, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					var xml = libxmljs.parseXmlString(body);
					var shows = [];

					xml.find('show').forEach(function(show) {
						shows.push({
							'type': 'show',
							'location': 'remote',
							'name': show.get('name').text(),
							'showid': parseInt(show.get('showid').text())
						});
					});

					redis.set(redis_show_key, JSON.stringify(shows));
					redis.expire(redis_show_key, 86400);

					res.json({
						'type': 'shows',
						'shows': shows
					});
				}
				else {
					if (response)
						log.error('/api/search' + req.params.show + '/remote HTTP-Code: ' + response.statusCode + ' error: ' + error);
					else
						log.error('/api/search' + req.params.show + '/remote error: ' + error);
					next();
				}
			});
		});
	});
};