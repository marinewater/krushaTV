var request = require('request');
var libxmljs = require("libxmljs");
var tvrage = require('../../config/tvrage.json');

module.exports = function(router, log, models, redis) {
	// search for matching shows in local database
	router.get('/search/:show', function(req, res) {
		var shows = [];

		var search_query = req.params.show.trim();

		models.Series.search(search_query).success(function(query_results) {

			query_results.forEach(function(sh) {
				var show = sh.dataValues;

				shows.push({
					'type': 'show',
					'location': 'local',
					'id': show.id,
					'showid': show.showid,
					'name': show.name,
					'genre': show.genre,
					'resource': '/api/show/' + show.id
				})
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
	router.get('/search/:show/remote', function(req, res, next) {
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