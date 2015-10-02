var models = require( './models' );

models.sequelize.query(
    'DELETE FROM "Episodes" ' +
    'WHERE id IN(' +
        'SELECT id FROM ( ' +
            'SELECT id, ' +
            'ROW_NUMBER() OVER(PARTITION BY season, episode, seriesid ORDER BY id asc) AS Row ' +
            'FROM "Episodes" ' +
        ') duplicates ' +
    'WHERE ' +
    'duplicates.Row > 1 ' +
    'ORDER BY id ASC);' )
    .then( function() {

        console.log( 'done' );

    })
    .catch( function( error ) {

        console.log( error );

    })
    .finally( function() {

        process.exit();

    });
