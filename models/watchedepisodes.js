"use strict";


module.exports = function(sequelize, DataTypes) {
	var WatchedEpisodes = sequelize.define("WatchedEpisodes", {
		},
	  	{
	    classMethods: {
			addConstraints: function() {
				sequelize
					.query('ALTER TABLE "' + WatchedEpisodes.tableName + '" ADD CONSTRAINT episode_user_unique UNIQUE (episodeid, userid);')
					.error(function(err){
						if (!(err.name === 'SequelizeDatabaseError' && err.message === 'error: relation "episode_user_unique" already exists')) {
							if ((process.env.NODE_ENV || "development") === 'development')
								console.log(err);
						}
					});
			},
			associate: function(models) {
				WatchedEpisodes.belongsTo(models.User, {
					foreignKey: {
						fieldName: 'userid',
						allowNull: false
					}
				});
				WatchedEpisodes.belongsTo(models.Episodes, {
					foreignKey: {
						fieldName: 'episodeid',
						allowNull: false
					}
				});
			},
			countWachtedEpisodes: function(models, userid, show_id_list) {
				return sequelize
					.query('select count(episodeid), seriesid from "' + WatchedEpisodes.tableName + '", "' + models.Episodes.tableName + '" where "' + WatchedEpisodes.tableName + '".episodeid = "' + models.Episodes.tableName + '".id AND "' + WatchedEpisodes.tableName + '".userid = ' + userid + ' group by seriesid');
			},
			seasonWatched: function(models, userid, season_nr, show_id) {
				userid = parseInt(userid);
				season_nr = parseInt(season_nr);
				show_id = parseInt(show_id);

				if (isNaN(userid) || isNaN(season_nr) || isNaN(show_id))
					return;

				return sequelize
					.query('INSERT INTO "' + WatchedEpisodes.tableName + '" ("createdAt", "updatedAt", episodeid, userid) SELECT now(), now(), "' + models.Episodes.tableName + '".id, ' + userid + ' FROM "' + models.Episodes.tableName + '" WHERE "' + models.Episodes.tableName + '".season=' + season_nr + ' AND "' + models.Episodes.tableName + '".seriesid = ' + show_id + ' AND NOT EXISTS(SELECT 1 FROM "' + WatchedEpisodes.tableName + '" WHERE "' + WatchedEpisodes.tableName + '".episodeid = "' + models.Episodes.tableName + '".id);');
			},
			showWatched: function(models, userid, show_id) {
				userid = parseInt(userid);
				show_id = parseInt(show_id);

				if (isNaN(userid) || isNaN(show_id))
					return;

				return sequelize
					.query('INSERT INTO "' + WatchedEpisodes.tableName + '" ("createdAt", "updatedAt", episodeid, userid) SELECT now(), now(), "' + models.Episodes.tableName + '".id, ' + userid + ' FROM "' + models.Episodes.tableName + '" WHERE "' + models.Episodes.tableName + '".seriesid = ' + show_id + ' AND NOT EXISTS(SELECT 1 FROM "' + WatchedEpisodes.tableName + '" WHERE "' + WatchedEpisodes.tableName + '".episodeid = "' + models.Episodes.tableName + '".id);');
			},
			deleteWatchedShow: function(models, userid, showid) {
				userid = parseInt(userid);
				showid = parseInt(showid);
				if (isNaN(userid) || isNaN(showid))
					return;

				return sequelize
					.query('DELETE FROM "' + WatchedEpisodes.tableName + '" w USING "' + models.Episodes.tableName + '" e WHERE w.episodeid = e.id AND w.userid = ' + userid + ' AND e.seriesid = ' + showid + ';');
			},
			deleteWatchedSeason: function(models, userid, seasonnr, showid) {
				userid = parseInt(userid);
				seasonnr = parseInt(seasonnr);
				showid = parseInt(showid);
				if (isNaN(userid) || isNaN(seasonnr) || isNaN(showid))
					return;

				return sequelize
					.query('DELETE FROM "' + WatchedEpisodes.tableName + '" w USING "' + models.Episodes.tableName + '" e WHERE w.episodeid = e.id AND w.userid = ' + userid + ' AND e.seriesid = ' + showid + ' AND e.season = ' + seasonnr + ';');
			}
		}
	});

	return WatchedEpisodes;
};