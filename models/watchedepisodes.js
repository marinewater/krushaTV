"use strict";


module.exports = function(sequelize, DataTypes) {
	var WatchedEpisodes = sequelize.define("WatchedEpisodes", {
		},
	  	{
	    classMethods: {
			addConstraints: function() {
				sequelize
					.query('ALTER TABLE "' + WatchedEpisodes.tableName + '" ADD CONSTRAINT episode_user_unique UNIQUE (episodeid, userid);')
					.catch(function(err){
						if (!(err.name === 'SequelizeDatabaseError' && err.message === 'relation "episode_user_unique" already exists')) {
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
					.query('SELECT COUNT(episodeid), seriesid ' +
					'FROM "' + WatchedEpisodes.tableName + '" w, "' + models.Episodes.tableName + '" e ' +
					'WHERE w.episodeid = e.id AND w.userid = ' + userid + ' GROUP BY "seriesid";');
			},
			seasonWatched: function(models, userid, season_nr, show_id) {
				userid = parseInt(userid);
				season_nr = parseInt(season_nr);
				show_id = parseInt(show_id);

				if (isNaN(userid) || isNaN(season_nr) || isNaN(show_id))
					return;

				return sequelize
					.query('INSERT INTO "' + WatchedEpisodes.tableName + '" ("createdAt", "updatedAt", "episodeid", "userid") ' +
					'SELECT now(), now(), e.id, ' + userid + ' FROM "' + models.Episodes.tableName + '" e ' +
					'WHERE e.season = ' + season_nr +
					' AND e.seriesid = ' + show_id +
					' AND e.airdate <= now() ' +
					' AND NOT EXISTS(SELECT 1 FROM "' + WatchedEpisodes.tableName + '" w ' +
					'WHERE w.episodeid = e.id ' +
					'AND w.userid = ' + userid + ');');
			},
			showWatched: function(models, userid, show_id) {
				userid = parseInt(userid);
				show_id = parseInt(show_id);

				if (isNaN(userid) || isNaN(show_id))
					return;

				return sequelize
					.query('INSERT INTO "' + WatchedEpisodes.tableName + '" ("createdAt", "updatedAt", "episodeid", "userid") ' +
					'SELECT now(), now(), e.id, ' + userid + ' FROM "' + models.Episodes.tableName + '" e ' +
					'WHERE e.seriesid = ' + show_id +
					' AND e.airdate <= now() ' +
					'AND NOT EXISTS(SELECT 1 FROM "' + WatchedEpisodes.tableName + '" w WHERE w.episodeid = e.id ' +
					'AND w.userid = ' + userid + ');');
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