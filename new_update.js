var tvdb_api_key = require( __dirname + '/config/thetvdb' ).key;
var a = require( __dirname + '/app/modules/tvdb' );
var tvdb = new a( tvdb_api_key, {
    language: 'en'
} );

var models = require( __dirname + '/models' );
var Promise = require( 'bluebird' );

var shows;

function add_to_db( show ) {

    return tvdb.SearchSeries( {
        imdb_id: show.imdbid
    })
        .then( function( response ) {
            if ( response.data ) {

                show.thetvdb_id = response.data[0].id;

                return show.save();
            }
            else {
                console.log(show.imdbid);
                console.log(show.name);
                console.log( response );
            }
        })
        .catch( function( err ) {

            console.log( show.dataValues.name );
            console.log( err );

        });
}

function update_episodes ( show, page ) {

    return tvdb.SeriesEpisodes( show.thetvdb_id, page )
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

                return models.Episodes.findOrCreate( {
                    where: {
                        seriesid: show.id,
                        season: season,
                        episode: episode_nr
                    },
                    defaults: {
                        seriesid: show.id,
                        season: season,
                        episode: episode_nr,
                        title: episode.episodeName,
                        airdate: airdate,
                        thetvdb_id: episode.id,
                        overview: episode.overview
                    }
                })
                    .spread( function( instance, created ) {

                        if ( !created ) {
                            instance.thetvdb_id = episode.id;
                            instance.overview = episode.overview;
                            instance.title = episode.episodeName;
                            instance.airdate = airdate;

                            return instance.save();

                        }

                    });
            }, {
                concurrency: 5
            })
                .then( function() {

                    var next_page = parseInt( data.links.next );

                    if ( !isNaN( next_page ) && next_page > 0 ) {
                        return update_episodes( show, next_page );
                    }
                });

        })
        .catch( console.log );

}

models.Series.findAll( {
    where: {
        imdbid: {
            ne: null
        }
    }
})
    .then( function( _shows ) {

        shows = _shows;

        return tvdb.login()

    })
    .then( function() {

        return shows;

    })
    .map( add_to_db, {
        concurrency: 5
    } )

    .then( function() {

        return models.Series.findAll( {
            where: {
                thetvdb_id: {
                    ne: null
                }
            }
        });

    })
    .each( function( show ) {

        return update_episodes( show );

    } )
    .then( function() {
        console.log( 'done' );
    })
    .catch( console.log )
    .finally( function() {

        process.exit( 0 );

    });