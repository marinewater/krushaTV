module.exports = function(sequelize, DataTypes) {
	var TrackShow = sequelize.define("TrackShow", {
	},
	{
		classMethods: {

			associate: function(models) {
				TrackShow.belongsTo(models.Series, {foreignKey: {
						fieldName: 'showid',
						allowNull: false
					}
				});
				TrackShow.belongsTo(models.User, {foreignKey: {
						fieldName: 'userid',
						allowNull: false
					}
				});
			},
			addConstraints: function(models) {
				sequelize
					.query('ALTER TABLE "' + TrackShow.tableName + '" ADD CONSTRAINT show_user_unique UNIQUE (showid, userid);')
					.error(function(err){
						if (!(err.name === 'SequelizeDatabaseError' && err.message === 'error: relation "show_user_unique" already exists')) {
							if ((process.env.NODE_ENV || "development") === 'development')
								console.log(err);
						}
				});
			},
			unwatchedEpisodes: function(models, userid) {
				userid = parseInt(userid);
				if (isNaN(userid))
					return;

				return sequelize
					.query('SELECT showid, season, episode, title, airdate, e.id as episodeid FROM "' + TrackShow.tableName + '", "' + models.Episodes.tableName + '" e WHERE userid = ' + userid + ' AND "' + TrackShow.tableName + '".showid = e.seriesid AND NOT EXISTS (SELECT 1 FROM   "' + models.WatchedEpisodes.tableName + '" w WHERE  w.episodeid = e.id AND w.userid = ' + userid + ');');
			},
			watchedEpisodes: function(models, userid) {
				userid = parseInt(userid);
				if (isNaN(userid))
					return;

				return sequelize
					.query('SELECT t.showid, e.season, e.episode, e.title, e.airdate, w.episodeid FROM "' + TrackShow.tableName + '" t, "' + models.Episodes.tableName + '" e, "' + models.WatchedEpisodes.tableName + '" w WHERE t.userid = ' + userid + ' AND w.userid = ' + userid + ' AND t.showid = e.seriesid AND e.id = w.episodeid;')
			}
		}
	});

	return TrackShow;
};