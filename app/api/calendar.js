module.exports = function(router, log, models, user) {
    router.get('/calendar/:year/:month', user.isLoggedIn, function(req, res, next) {
        var month = parseInt(req.params.month);
        var year = parseInt(req.params.year);

        if (isNaN(year) || isNaN(month) || year < 1900 || year > 3000 || month < 1 || month > 12) {
            res.status(400);
            return res.json({
                'type': 'error',
                'code': 400,
                'message': 'month and year have to be integers (1 <= month <= 12; 1900 <= year <= 3000)'
            });
        }

        models.TrackShow.monthEpisodes(req.user.id, year, month).then(function(db_episodes) {
            return res.json({
                'type': 'episodes',
                'span': 'month',
                'episodes': db_episodes
            });
        }).catch(function(err) {
            log.error('/calendar/' + year + '/' + month + ' DB error', err);

            res.status(400);
            return res.json({
                'type': 'error',
                'code': 400,
                'message': 'Bad Request'
            });
        });
    });

    router.get('/calendar/:year/:month/:day/week', user.isLoggedIn, function(req, res, next) {
        var day = parseInt(req.params.day);
        var month = parseInt(req.params.month);
        var year = parseInt(req.params.year);

        if (isNaN(year) || isNaN(month) || isNaN(day) || year < 1900 || year > 3000 || month < 1 || month > 12 || day < 1 || day > 31) {
            res.status(400);
            return res.json({
                'type': 'error',
                'code': 400,
                'message': 'day, month and year have to be integers (1 <= day <= 31; 1 <= month <= 12; 1900 <= year <= 3000)'
            });
        }

        models.TrackShow.weekEpisodes(req.user.id, year, month, day).then(function(db_episodes) {
            return res.json({
                'type': 'episodes',
                'span': 'week',
                'episodes': db_episodes
            });
        }).catch(function(err) {
            log.error('/calendar/' + year + '/' + month + '/' + day + ' DB error', err);

            res.status(400);
            return res.json({
                'type': 'error',
                'code': 400,
                'message': 'Bad Request'
            });
        });
    });
};