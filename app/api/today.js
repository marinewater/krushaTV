module.exports = function( router, log, models, redis ) {
	/**
	 * api endpoint that returns a list of yesterdays, todays, and tomorrows episodes
	 * returns only tracked shows if the user is logged in
	 */
	router.get( '/today', function( req, res, next ) {

		if ( req.isAuthenticated() ) {

			var todaysEpisodes = models.Episodes.getTodaysEpisodes( models, req.user.id );

			todaysEpisodes
				.spread( function( returning ) {

					return res.json( {
						'type': 'todaysEpisodes',
						'episodes': returning
					} );

				})
				.catch( function( err ) {

					log.error('GET /api/today DB: ' + err);
					return next;

				} );

		}
		else {

			var redis_today_key = 'kTV:today';

			redis.get( redis_today_key, function ( err, redis_today ) {

				if ( err ) {

					return log.error( 'GET /api/today redis: ' + err );

				}
				else if ( redis_today ) {

					return res.json( {
						'type': 'todaysEpisodes',
						'episodes': JSON.parse(redis_today)
					} );

				}
				else {

					var todaysEpisodes = models.Episodes.getTodaysEpisodes( models );

					todaysEpisodes
						.spread( function( returning ) {

							redis.set( redis_today_key, JSON.stringify( returning ));
							redis.expire( redis_today_key, 3600 );

							return res.json( {
								'type': 'todaysEpisodes',
								'episodes': returning
							} );

						})
						.catch( function( err ) {

							log.error( 'GET /api/today DB: ' + err );
							return next;
							
						});
				}
			});

		}

	});
};