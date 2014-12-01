var order_regex = '(?i)(?:^the )?(.*)';

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
			watchedEpisodes: function(models, userid) {
				userid = parseInt(userid);
				if (isNaN(userid))
					return;

				return sequelize
					.query('SELECT t.showid, e.season, e.episode, e.title, e.airdate, w.episodeid FROM "' + TrackShow.tableName + '" t, "' + models.Episodes.tableName + '" e, "' + models.WatchedEpisodes.tableName + '" w WHERE t.userid = ' + userid + ' AND w.userid = ' + userid + ' AND t.showid = e.seriesid AND e.id = w.episodeid;')
			},
			watchedShows: function(models, userid) {
				userid = parseInt(userid);
				if (isNaN(userid))
					return;

				return sequelize
					.query('SELECT s.id, s.name FROM "' + TrackShow.tableName + '" t, "' + models.WatchedEpisodes.tableName + '" w, "' + models.Episodes.tableName + '" e, "' + models.Series.tableName + '" s WHERE t.showid = e.seriesid AND t.showid = s.id AND w.episodeid = e.id AND t.userid = ' + userid + ' AND w.userid = t.userid GROUP BY s.id, s.name ORDER BY substring(s.name from \'' + order_regex +' \');')
			},
			unwatchedShows: function(models, userid) {
				userid = parseInt(userid);
				if (isNaN(userid))
					return;

				return sequelize
					.query('SELECT s.id, s.name FROM "' + TrackShow.tableName + '" t, "' + models.Series.tableName + '" s, "' + models.Episodes.tableName + '" e \
						WHERE t.showid = s.id AND s.id = e.seriesid AND t.userid = ' + userid +
						' AND NOT EXISTS (SELECT 1 FROM "' + models.WatchedEpisodes.tableName + '" w WHERE w.episodeid = e.id AND w.userid = t.userid) \
						GROUP BY s.id, s.name \
						ORDER BY substring(s.name from \'' + order_regex +' \');')
			},
			unwatchedSeasons: function(models, userid, showid) {
				userid = parseInt(userid);
				showid = parseInt(showid);
				if (isNaN(userid) || isNaN(showid))
					return;

				return sequelize
					.query('SELECT e.season FROM "' + models.Episodes.tableName + '" e \
						WHERE e.seriesid = ' + showid +
						' AND NOT EXISTS (SELECT 1 FROM "' + models.WatchedEpisodes.tableName + '" w WHERE e.id = w.episodeid AND w.userid = ' + userid + ') \
						GROUP BY e.season \
						ORDER BY e.season;');
			},
			unwatchedEpisodes: function(models, userid, showid, season) {
				userid = parseInt(userid);
				showid = parseInt(showid);
				season = parseInt(season);
				if (isNaN(userid) || isNaN(showid) || isNaN(season))
					return;

				return sequelize
					.query('SELECT e.id, e.episode, e.title, e.airdate FROM "' + models.Episodes.tableName + '" e \
						WHERE e.seriesid = ' + showid + ' AND e.season = ' + season +
						' AND NOT EXISTS (SELECT 1 FROM "' + models.WatchedEpisodes.tableName + '" w WHERE w.episodeid = e.id AND w.userid = ' + userid + ') \
						ORDER BY e.episode;');
			}
		}
	});

	return TrackShow;
};