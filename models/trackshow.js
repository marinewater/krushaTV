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
					.catch(function(err){
						if (!(err.name === 'SequelizeDatabaseError' && err.message === 'relation "show_user_unique" already exists')) {
							if ((process.env.NODE_ENV || "development") === 'development')
								console.log(err);
						}
				});
			},
			watchedShows: function(models, userid) {
				userid = parseInt(userid);
				if (isNaN(userid))
					return;

				return sequelize
					.query('SELECT s.id, s.name FROM "' + TrackShow.tableName + '" t, "' + models.WatchedEpisodes.tableName + '" w, "' + models.Episodes.tableName + '" e, "' + models.Series.tableName + '" s WHERE t.showid = e.seriesid AND t.showid = s.id AND w.episodeid = e.id AND t.userid = ' + userid + ' AND w.userid = t.userid GROUP BY s.id, s.name ORDER BY substring(s.name from \'' + order_regex + '\');')
			},
			watchedSeasons: function(models, userid, showid) {
				userid = parseInt(userid);
				showid = parseInt(showid);
				if (isNaN(userid) || isNaN(showid))
					return;

				return sequelize
					.query('SELECT e.season FROM "' + models.WatchedEpisodes.tableName + '" w, "' + models.Episodes.tableName + '" e, "' + TrackShow.tableName + '" t \
							WHERE w.episodeid = e.id AND t.showid = e.seriesid AND w.userid = ' + userid + ' AND e.seriesid = ' + showid + ' AND t.userid = w.userid \
							GROUP BY e.season \
							ORDER BY e.season;');
			},
			watchedEpisodes: function(models, userid, showid, season) {
				userid = parseInt(userid);
				showid = parseInt(showid);
				season = parseInt(season);
				if (isNaN(userid) || isNaN(showid) || isNaN(season))
					return;

				return sequelize
					.query('SELECT e.id, e.episode, e.title, e.airdate FROM "' + models.WatchedEpisodes.tableName + '" w, "' + models.Episodes.tableName + '" e, "' + TrackShow.tableName + '" t \
							WHERE w.episodeid = e.id AND t.showid = e.seriesid AND w.userid = ' + userid + ' AND e.seriesid = ' + showid + ' AND e.season = ' + season + ' AND t.userid = w.userid \
							ORDER BY e.episode;');
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
						ORDER BY substring(s.name from \'' + order_regex + '\');')
			},
			unwatchedSeasons: function(models, userid, showid) {
				userid = parseInt(userid);
				showid = parseInt(showid);
				if (isNaN(userid) || isNaN(showid))
					return;

				return sequelize
					.query('SELECT e.season FROM "' + models.Episodes.tableName + '" e, "' + models.TrackShow.tableName + '" t \
							WHERE e.seriesid = t.showid AND e.seriesid = ' + showid + ' AND t.userid = ' + userid +
							' AND NOT EXISTS (SELECT 1 FROM "' + models.WatchedEpisodes.tableName + '" w WHERE e.id = w.episodeid AND w.userid = t.userid) \
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
					.query('SELECT e.id, e.episode, e.title, e.airdate FROM "' + models.Episodes.tableName + '" e, "' + models.TrackShow.tableName + '" t \
						WHERE e.seriesid = t.showid AND t.userid = ' + userid + ' AND e.seriesid = ' + showid + ' AND e.season = ' + season +
						' AND NOT EXISTS (SELECT 1 FROM "' + models.WatchedEpisodes.tableName + '" w WHERE w.episodeid = e.id AND w.userid = t.userid) \
						ORDER BY e.episode;');
			},

			monthEpisodes: function(userid, year, month) {
				userid = parseInt(userid);
				year = parseInt(year);
				month = parseInt(month);
				if (isNaN(userid) || isNaN(year) || isNaN(month) || year < 1900 || year > 3000 || month < 1 || month > 12)
					return;

				var date = year + '-' + month + '-01';

				return sequelize
					.query('SELECT s.id, s.name, e.episode, e.season, e.title, e.airdate ' +
					'FROM "' + sequelize.models.TrackShow.tableName + '" t, "' + sequelize.models.Series.tableName + '" s, "' + sequelize.models.Episodes.tableName + '" e ' +
					'WHERE t.showid = s.id AND e.seriesid = s.id AND t.userid = ' + userid +
					'AND e.airdate >= date_trunc(\'month\', date(\'' + date + '\'))' +
					'AND e.airdate <= date_trunc(\'month\', date(\'' + date + '\')) + \'1month\'::interval - \'1sec\'::interval;');
			},

			weekEpisodes: function(userid, year, month, day) {
				userid = parseInt(userid);
				year = parseInt(year);
				month = parseInt(month);
				day = parseInt(day);
				if (isNaN(userid) || isNaN(year) || isNaN(month) || isNaN(day) || year < 1900 || year > 3000 || month < 1 || month > 12 || day < 1 || day > 31)
					return;

				var date_parsed = new Date(year, month-1, day);
				var date = date_parsed.getFullYear() + '-' + (date_parsed.getMonth() + 1) + '-' + date_parsed.getDate();

				return sequelize
					.query('SELECT s.id, s.name, s.genre, e.episode, e.season, e.title, e.airdate ' +
					'FROM "' + sequelize.models.TrackShow.tableName + '" t, "' + sequelize.models.Series.tableName + '" s, "' + sequelize.models.Episodes.tableName + '" e ' +
					'WHERE t.showid = s.id AND e.seriesid = s.id AND t.userid = ' + userid +
					'AND e.airdate >= date_trunc(\'week\', \'' + date + '\'::timestamp)' +
					'AND e.airdate <= (date_trunc(\'week\', \'' + date + '\'::timestamp)+ \'6 days\'::interval)::date;');
			},

			weekSpan: function(year, month, day) {
				year = parseInt(year);
				month = parseInt(month);
				day = parseInt(day);
				if (isNaN(year) || isNaN(month) || isNaN(day) || year < 1900 || year > 3000 || month < 1 || month > 12 || day < 1 || day > 31)
					return;

				var date_parsed = new Date(year, month-1, day);
				var date = date_parsed.getFullYear() + '-' + (date_parsed.getMonth() + 1) + '-' + date_parsed.getDate();

				return sequelize
					.query('SELECT ' +
					'date_trunc(\'week\', \'' + date + '\'::timestamp) as from, ' +
					'(date_trunc(\'week\', \'' + date + '\'::timestamp)+ \'6 days\'::interval)::date as to;');
			}
		}
	});

	return TrackShow;
};