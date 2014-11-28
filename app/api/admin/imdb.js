module.exports = function(router, log, models) {

    // return a list of all imdb ids the users have submitted
    router.get('/imdb', isAdmin, function(req, res, next) {
        models.Imdb.findAll({ include: [models.Series]}).success(function(returning) {
            if (returning.length === 0) {
                res.status(404);
                return res.json({
                    'type': 'error',
                    'code': 404,
                    'message': 'no imdb ids submitted'
                });
            }

            var imdb_ids = [];

            returning.forEach(function(su) {
                var submitted_imdb_id = su.dataValues;

                imdb_ids.push({
                    'showid': submitted_imdb_id.showid,
                    'imdb_id': submitted_imdb_id.imdb_id,
                    'showname': submitted_imdb_id.Series.name,
                    'id': submitted_imdb_id.id
                });
            });

            return res.json({
                'type': 'submitted_imdb_ids',
                'imdb_ids': imdb_ids
            });
        }).error(function(err) {
            log.error(' GET /api/admin/imdb DB: ' + err);
            next();
        });
    });

    // accept a submission for a imdb id and delete all the submissions connected to the show
    router.put('/imdb/:submission_id', isAdmin, function(req, res, next) {
        var submission_id = parseInt(req.params.submission_id);
        if (isNaN(submission_id)) {
            res.status(400);
            return res.json({
                'type': 'error',
                'code': 400,
                'message': 'submission_id must be integer'
            });
        }

        models.Imdb.find({ where: { 'id': submission_id }, include: [models.Series] }).success(function(returning) {
            // the submission does not exist
            if (returning === null) {
                res.status(404);
                return res.json({
                    'type': 'error',
                    'code': 404,
                    'message': 'submission_id does not exist'
                });
            }

            // some other user beat you to it
            if (returning.dataValues.Series.dataValues.imdbid !== null) {
                res.status(400);
                return res.json({
                    'type': 'error',
                    'code': 400,
                    'message': 'There is already a imdb_id for this show submitted'
                });
            }

            models.Series.update({ 'imdbid': returning.dataValues.imdb_id},
                { where: { 'id': returning.dataValues.showid }}).success(function() {

                    // delete all submissions for the show
                    models.Imdb.destroy({ where: { 'showid': returning.dataValues.showid }}).success(function() {
                        return res.json({
                            'type': 'imdb_submission',
                            'result': 'accepted'
                        });
                    }).error(function(err) {
                        log.error('PUT /api/admin/imdb/' + submission_id + ' DB: ' + err);
                        next();
                    });
                }).error(function(err) {
                    if (err.name === 'SequelizeUniqueConstraintError' && err.fields.indexOf('imdbid' ) > -1) {
                        res.status(409);
                        return res.json({
                            'type': 'error',
                            'code': 409,
                            'message': 'This imdb id has already been submitted to another show.'
                        });
                    }
                    else {
                        log.error('PUT /api/admin/imdb/' + submission_id + ' DB: ' + err);
                        next();
                    }
                });
        }).error(function(err) {
            log.error('PUT /api/admin/imdb/' + submission_id + ' DB: ' + err);
            next();
        });
    });

    // route middleware to make sure a user is an admin
    function isAdmin(req, res, next) {

        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            if (req.user.admin === true) {
                return next();
            }
            else {
                res.status(403);
                return res.json({
                    'type': 'error',
                    'code': 403,
                    'message': 'you do not have access to this resource'
                });
            }
        else {
            // if they aren't redirect them to the home page
            res.status(401);
            return res.json({
                'type': 'error',
                'code': 401,
                'message': 'not logged in'
            });
        }
    }
};