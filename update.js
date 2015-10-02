//////////////////////////////
// krushaTV episode updater //
//////////////////////////////

// set environment variable
var env = process.env.NODE_ENV || "development";

// DB Models
var models = require( './models' );

// LOGGING
var bunyan	= require( 'bunyan' );
var log_options = {
	name: 'krushaTV_update',
	streams: [ {
        path: './log/krushaTV_update.log',
        level: 'error'
    } ]
};
if ( env !== 'production' ) {
	log_options.streams.push( {
		level: 'info',
		stream: process.stdout 
	});
}
var log = bunyan.createLogger( log_options );

// Promise library
var Promise = require( 'bluebird' );

// Sanitizing
var sanitizeHtml = require( 'sanitize-html' );

// File IO
var fs = Promise.promisifyAll( require( 'fs' ) );

// TVDb api
var tvdb_api_key = require( __dirname + '/config/thetvdb' ).key;
var tvdb_temp = require( __dirname + '/app/modules/tvdb' );
var TVDb = new tvdb_temp( tvdb_api_key, {
	language: 'en'
} );

// Time library
var moment = require( 'moment' );


var last_updated = null;
var now = null;
var last_updated_file = __dirname + '/config/last_updated.json';


function update_episodes( show, page ) {

    return TVDb.SeriesEpisodes( show.thetvdb_id, page )
        .then( function( data ) {

            if ( !data.data ) {

                console.log( show.name );
                console.log( page );
                return;
            }

            return Promise.map( data.data, function( episode ) {

                var season = parseInt( episode.airedSeason );
                var episode_nr = parseInt( episode.airedEpisodeNumber );

                var airdate = episode.firstAired ? new Date( episode.firstAired ) : null;

                if ( isNaN( season ) || season < 1 || isNaN( episode_nr ) || episode_nr < 1 ) {
                    return;
                }

                return models.Episodes.upsert( {
                    seriesid: show.id,
                    season: season,
                    episode: episode_nr,
                    title: episode.episodeName,
                    airdate: airdate,
                    thetvdb_id: episode.id,
                    overview: episode.overview
                })
            }, {
                concurrency: 5
            })
                .then( function() {

                    var next_page = parseInt( data.links.next );

                    if ( !isNaN( next_page ) && next_page > 0 ) {
                        return update_episodes( show, next_page );
                    }
                });

        });

}


fs.readFileAsync( last_updated_file, {
    encoding: 'utf8'
} )
    .then( function( last_updated_file_content ) {

        if ( last_updated_file_content.length > 0 ) {
            return JSON.parse( last_updated_file_content );
        }
    } )
    .then( function( _last_updated ) {

        if ( _last_updated ) {
            last_updated = moment( _last_updated ).toDate();
        }

    })
    .then( function() {

        return TVDb.login();

    } )
    .then( function() {

        now = moment().toDate();

        return TVDb.UpdatedQuery( last_updated )

    })
    .then( function( updated_shows ) {

        var shows_id_array = [];

        if ( updated_shows.data ) {
            updated_shows.data.forEach( function( show ) {

                shows_id_array.push( show.id );

            });
        }

        return models.Series.findAll( {
            where: {
                thetvdb_id: {
                    in: shows_id_array
                }
            }
        });

    })
    .each( update_episodes )
    .then( function() {

        return fs.writeFileAsync( last_updated_file, JSON.stringify( now ), {
            encoding: 'utf8'
        } );

    })
    .then( function() {

        console.log( 'done' );

    })
    .catch( function( error ) {

        log.error( error );

    })
    .finally( function() {

        process.exit( 0 );

    });