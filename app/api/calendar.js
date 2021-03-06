var sequelize = require('sequelize');
var Promise = require("bluebird");

module.exports = function(router, log, models, user) {
    /**
     * api endpoint that returns all tracked shows for a month
     */
    router.get( '/calendar/:year/:month', user.isLoggedIn, function( req, res, next ) {

        var month = parseInt( req.params.month );
        var year = parseInt( req.params.year );

        // checks if month and year a numbers in a believable range
        if ( isNaN( year ) || isNaN( month ) || year < 1900 || year > 3000 || month < 1 || month > 12 ) {

            res.status( 400 );
            return res.json( {
                'type': 'error',
                'code': 400,
                'message': 'month and year have to be integers (1 <= month <= 12; 1900 <= year <= 3000)'
            } );
        }

        models.TrackShow.monthEpisodes( req.user.id, year, month )
            .spread( function( db_episodes ) {

                return res.json( {
                    'type': 'episodes',
                    'span': 'month',
                    'episodes': db_episodes
                } );

            })
            .catch( function( err ) {

                log.error('/calendar/' + year + '/' + month + ' DB error', err);

                res.status( 400 );
                return res.json( {
                    'type': 'error',
                    'code': 400,
                    'message': 'Bad Request'
                } );

            });

    });

    /**
     * api endpoint that returns all tracked shows for a week
     * takes a day and returns a set of shows for monday before this date until sunday
     */
    router.get( '/calendar/:year/:month/:day/week', user.isLoggedIn, function( req, res, next ) {

        var day = parseInt( req.params.day );
        var month = parseInt( req.params.month );
        var year = parseInt( req.params.year );

        // checks that year, month and day are in a believable range; dates like 31. of february will be handled by the database
        if ( isNaN( year ) || isNaN( month ) || isNaN( day ) || year < 1900 || year > 3000 || month < 1 || month > 12 || day < 1 || day > 31 ) {

            res.status( 400 );
            return res.json( {
                'type': 'error',
                'code': 400,
                'message': 'day, month and year have to be integers (1 <= day <= 31; 1 <= month <= 12; 1900 <= year <= 3000)'
            } );

        }

        var queries = [];

        queries.push( models.TrackShow.weekEpisodes( req.user.id, year, month, day ) );
        queries.push( models.TrackShow.weekSpan( year, month, day ) );

        Promise.all( queries )
            .spread( function( db_episodes, time_frame ) {

                return res.json( {
                    'type': 'episodes',
                    'span': {
                        'type': 'week',
                        'frame': time_frame[0][0]
                    },
                    'episodes': db_episodes[0]
                } );

            })
            .catch( function( err ) {

                log.error( '/calendar/' + year + '/' + month + '/' + day + '/week DB error', err );

                res.status( 400 );
                return res.json( {
                    'type': 'error',
                    'code': 400,
                    'message': 'Bad Request'
                } );

            });

    });

    /**
     * api endpoint that returns all tracked shows for a specific day
     */
    router.get( '/calendar/:year/:month/:day', user.isLoggedIn, function( req, res, next ) {

        var day = parseInt( req.params.day );
        var month = parseInt( req.params.month );
        var year = parseInt( req.params.year );

        // checks that year, month and day are in a believable range; dates like 31. of february will be handled by the database
        if ( isNaN( year ) || isNaN( month ) || isNaN( day ) || year < 1900 || year > 3000 || month < 1 || month > 12 || day < 1 || day > 31) {

            res.status( 400 );
            return res.json( {
                'type': 'error',
                'code': 400,
                'message': 'day, month and year have to be integers (1 <= day <= 31; 1 <= month <= 12; 1900 <= year <= 3000)'
            } );

        }

        // get episodes from date until date_after
        var date = new Date( Date.UTC( year, month-1, day ) );
        var date_after = new Date( Date.UTC(year, month-1, day+1 ) );

        models.Series.findAll( {
            attributes: [ 'id', 'name', 'genre' ],
            include: [
                {
                    model: models.TrackShow,
                    required: true,
                    where: {
                        userid: req.user.id
                    },
                    attributes: []
                },
                {
                    model: models.Episodes,
                    required: true,
                    where: {
                        airdate: {
                            gte: date,
                            lt: date_after
                        },
                        season: {
                            gt: 0
                        }
                    },
                    attributes: [ 'episode', 'season', 'title', 'airdate' ],
                    include: [
                        {
                            model: models.WatchedEpisodes,
                            where: {
                                userid: sequelize.literal( '"' + models.Episodes.tableName + '.' + models.WatchedEpisodes.tableName + '".userid = ' + req.user.id )
                            },
                            attributes: [ [ 'id', 'watched' ] ],
                            required: false
                        }
                    ]
                }
            ]
        })
            .then( function( data ) {

                var episodes = [];

                data.forEach( function( episode ) {
                    episodes.push( {
                        id: episode.id,
                        name: episode.name,
                        genre: episode.genre,
                        episode: episode.Episodes[0].episode,
                        season: episode.Episodes[0].season,
                        title: episode.Episodes[0].title,
                        airdate: episode.Episodes[0].airdate,
                        watched: episode.Episodes[0].WatchedEpisodes.length > 0
                    } );
                });

                return res.json( {
                    'type': 'episodes',
                    'span': {
                        'type': 'day',
                        'date': date
                    },
                    'episodes': episodes
                } );

            })
            .catch( function( err ) {

                log.error( '/calendar/' + year + '/' + month + '/' + day + ' DB error', err );

                res.status( 400 );
                return res.json( {
                    'type': 'error',
                    'code': 400,
                    'message': 'Bad Request'
                } );

            });
    });
};