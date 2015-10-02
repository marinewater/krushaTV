'use strict';

module.exports = {

    up: function ( queryInterface, Sequelize ) {

        queryInterface.changeColumn(
            'Series',
            'showid',
            {
                type: Sequelize.INTEGER,
                allowNull: true
            }
        );

        queryInterface.addColumn(
            'Series',
            'thetvdb_id',
            {
                type: Sequelize.INTEGER,
                unique: true,
                allowNull: true
            }
        );

        queryInterface.addColumn(
            'Episodes',
            'thetvdb_id',
            {
                type: Sequelize.INTEGER,
                unique: true,
                allowNull: true
            }
        );

        queryInterface.addColumn(
            'Episodes',
            'overview',
            {
                type: Sequelize.TEXT,
                allowNull: true
            }
        );

        queryInterface.addIndex(
            'Episodes',
            [ 'season', 'episode', 'seriesid' ],
            {
                indexName: 'UniqueEpisode',
                indicesType: 'UNIQUE'
            }
        );

    },

    down: function ( queryInterface, Sequelize ) {

        queryInterface.changeColumn(
            'Series',
            'showid',
            {
                type: Sequelize.INTEGER,
                allowNull: false
            }
        );

        queryInterface.removeColumn( 'Series', 'thetvdb_id' );

        queryInterface.removeColumn( 'Episodes', 'thetvdb_id' );

        queryInterface.removeColumn( 'Episodes', 'overview' );

    }

};
