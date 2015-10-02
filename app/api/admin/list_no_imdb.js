module.exports = function( router, log, models, user ) {

    router.get( '/no-imdb/:from?', user.isAdmin, function( req, res, next ) {

        req.checkParams( 'from', 'Invalid from parameter' ).optional().isInt();

        var errors = req.validationErrors();

        if ( errors ) {
            res.status( 400 );
            return res.json( {
                type: 'error',
                code: 400,
                resource: '/no-imdb/:from?',
                errors: errors
            })
        }

        if ( !req.params.from ) {
            req.params.from = 0;
        }

        models.Series.findAndCount( {
            where: {
                imdbid: null
            },
            offset: req.params.from,
            limit: 5,
            attributes: [ 'id', 'name', 'ended' ],
            order: [ [ 'ended', 'ASC' ], [ 'updatedAt', 'DESC' ] ]
        } )
            .then( function( shows ) {

                res.json( {
                    type: 'shows',
                    total_count: shows.count,
                    from: req.params.from,
                    to: req.params.from + shows.rows.length - 1,
                    shows: shows.rows
                } );

            })
            .catch( function( error ) {

                log.error( ' GET /api/admin/no-imdb DB: ' + error );
                next();

            });

    } );

};