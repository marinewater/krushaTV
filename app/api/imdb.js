module.exports = function(router, log, models, user) {
    // add show to list of tracked shows
    router.post('/imdb', user.isLoggedIn, function(req, res, next) {
        var showid = parseInt(req.body.showid);
        if (isNaN(showid)) {
            res.status(400);
            return res.json({
                'type': 'error',
                'code': 400,
                'message': 'showid must be integer'
            });
        }

        if (!(req.body.hasOwnProperty('imdb_id'))) {
            res.status(400);
            return res.json({
                'type': 'error',
                'code': 400,
                'message': 'no imdb id supplied'
            });
        }

        var imdb_regex = /^(?:https?:\/\/)?(?:www.)?(?:imdb.com\/title\/)?(tt\d{7})(?:\/.*)?$/i;

        var match = req.body.imdb_id.match(imdb_regex);

        if (!match) {
            res.status(400);
            return res.json({
                'type': 'error',
                'code': 400,
                'message': 'imdb_id is not a valid imdb id'
            });
        }

        models.Series.findOne({ where: { 'id': showid } }).success(function(show) {
            if (show !== null) {
                if (show.dataValues.imdbid === null) {
                    models.Imdb.findOrCreate({
                        where: { 'userid': req.user.id, 'showid': showid},
                        defaults: { 'userid': req.user.id, 'showid': showid, 'imdb_id': match[1]}
                    }).success(function(affected) {
                        if (affected[1]) {
                            res.status(201);
                            return res.json({
                                'type': 'imdb',
                                'success': true
                            });
                        }
                        else {
                            res.status(400);
                            return res.json({
                                'type': 'error',
                                'code': 400,
                                'message': 'user has already submitted an imdb id for this show'
                            });
                        }
                    }).error(function(err) {
                        log.error('POST /api/imdb DB: ' + err);
                        res.status(400);
                        return res.json({
                            'type': 'error',
                            'code': 400,
                            'message': 'Bad Request'
                        });
                    });
                }
                else {
                    res.status(400);
                    return res.json({
                        'type': 'error',
                        'code': 400,
                        'message': 'show already has an imdb id'
                    });
                }
            }
            else {
                res.status(404);
                return res.json({
                    'type': 'error',
                    'code': 404,
                    'message': 'show does not exist'
                });
            }
        }).error(function(err) {
            log.error('POST /api/imdb DB: ' + err);
            res.status(400);
            return res.json({
                'type': 'error',
                'code': 400,
                'message': 'Bad Request'
            });
        });
    });
};