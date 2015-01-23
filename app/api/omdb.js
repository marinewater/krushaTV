var env = process.env.NODE_ENV || "development";
var request = require('request');

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

module.exports = function(router, log, redis) {
    // add show to list of tracked shows
    router.get('/omdb/:imdb_id', bruteforce.prevent, function(req, res, next) {
        var imdb_regex = /^tt\d{7}$/i;

        var match = req.params.imdb_id.match(imdb_regex);

        if (!match) {
            res.status(400);
            return res.json({
                'type': 'error',
                'code': 400,
                'message': 'imdb_id is not a valid imdb id'
            });
        }
        
        var redis_omdb_key = 'kTV:omdb: ' + match[0];
        
        redis.get(redis_omdb_key, function (err, redis_omdb_data) {
            if (err) {
                log.error('GET /api/omdb/' + req.params.imdb_id + ' redis: ', err);
            }
            else if (redis_omdb_data) {
                return res.json(JSON.parse(redis_omdb_data));
            }
            else {
                request('http://www.omdbapi.com/?r=json&i=' + match[0], function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        redis.set(redis_omdb_key, JSON.stringify(JSON.parse(body)));
                        redis.expire(redis_omdb_key, 604800); // expire after a week

                        return res.json(JSON.parse(body));
                    }
                    else {
                        if (response)
                            log.error('GET /api/omdb/' + req.params.imdb_id + ' HTTP-Code: ' + response.statusCode + ' error: ' + error);
                        else
                            log.error('GET /api/omdb/' + req.params.imdb_id + ' error: ' + error);
                        next();
                    }
                });
            }
        });
    });
};