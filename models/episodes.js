"use strict";


module.exports = function(sequelize, DataTypes) {
	var Episodes = sequelize.define("Episodes", {
		season: { type: DataTypes.INTEGER, allowNull: false },
		episode: { type: DataTypes.INTEGER, allowNull: false },
		title: { type: DataTypes.TEXT, allowNull: false },
		airdate: { type: DataTypes.DATE },
        update: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
	},
  	{
    classMethods: {
      associate: function(models) {
        Episodes.hasMany(models.WatchedEpisodes, {
          foreignKey: {
            fieldName: 'episodeid',
            allowNull: false
          }
        });
      },
      countSeasons: function(show_ids) {
        var query = '(' + show_ids.join('), (') + ')';
        return sequelize.query('SELECT a.seriesid, COUNT(DISTINCT b.season) as season_count, COUNT(b.episode) as episode_count ' +
        'FROM (VALUES ' + query + ') as a(seriesid) LEFT OUTER JOIN "' + Episodes.tableName + '" AS b on b.seriesid = a.seriesid ' +
        'WHERE b.airdate <= now() ' +
        'GROUP BY a.seriesid;');
      },
      getTodaysEpisodes: function(models, userid) {
        var select = 'SELECT e.title, e.season, e.episode, s.name as showname, s.id as showid,';
        var from = 'FROM "' + Episodes.tableName + '" e, "' + models.Series.tableName + '" s';
        var where = '';
        var limit = ' LIMIT 50;';

        if (typeof userid !== 'undefined') {
          userid = parseInt(userid);
          if (isNaN(userid)) {
            return;
          }
          select +=  ' ROUND(EXTRACT(epoch FROM ((now()-e.airdate) - user_interval.episode_offset))/86400-0.5)::int as age ';
          from += ', "' + models.TrackShow.tableName + '" t, (SELECT u.episode_offset FROM "' + models.User.tableName + '" u';
          where = ' WHERE u.id = ' + userid + ' LIMIT 1) as user_interval WHERE e.seriesid = s.id AND s.id = t.showid AND t.userid = ' + userid + ' AND (now()-e.airdate) <= (user_interval.episode_offset + interval \'2 day\') AND (now()-e.airdate) >= (user_interval.episode_offset - interval \'1 day\')';
        }
        else {
          select +=  ' ROUND(EXTRACT(epoch FROM age(e.airdate))/86400) as age ';
          where = ' WHERE e.seriesid = s.id AND age(e.airdate) <= interval \'1 days\' AND age(e.airdate) >= interval \'-1 days\'';
        }

        var query = select + from + where + limit;
        return sequelize.query(query);
      },
      getSeasons: function(models, show_id) {
        show_id = parseInt(show_id);

        if (isNaN(show_id)) {
          return;
        }

        var query = 'SELECT e.season, count(e.id) AS episode_count\
        FROM "Episodes" e\
        WHERE e.seriesid = ' + show_id +
        'GROUP BY e.season\
        ORDER BY e.season';

        return sequelize.query(query);
      },
      getSeasonsWatched: function(models, show_id, user_id) {
        show_id = parseInt(show_id);
        user_id = parseInt(user_id);

        if (isNaN(show_id) || isNaN(user_id)) {
          return;
        }

        var query = 'SELECT e.season, count(CASE WHEN e.airdate <= now() THEN 1 END) AS episode_count, count(CASE WHEN w.id IS NOT NULL AND e.airdate <= now() THEN 1 END) AS watched_count\
        FROM "' + models.Episodes.tableName + '" e LEFT OUTER JOIN "' + models.WatchedEpisodes.tableName + '" w ON (w.userid = ' + user_id + ' AND w.episodeid = e.id)\
        WHERE e.seriesid = ' + show_id +
        'GROUP BY e.season\
        ORDER BY e.season;';

        return sequelize.query(query);
      }
    }
  });

	return Episodes;
};