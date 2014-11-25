"use strict";


module.exports = function(sequelize, DataTypes) {
	var Episodes = sequelize.define("Episodes", {
		season: { type: DataTypes.INTEGER, allowNull: false },
		episode: { type: DataTypes.INTEGER, allowNull: false },
		title: { type: DataTypes.TEXT, allowNull: false },
		airdate: { type: 'DATE' },
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
        return sequelize.query('select a.seriesid, count(DISTINCT b.season) as season_count, count(b.episode) as episode_count from (values ' + query + ') as a(seriesid) left outer join "' + Episodes.tableName + '" as b on b.seriesid = a.seriesid group by a.seriesid');
      },
      getTodaysEpisodes: function(models, userid) {
        var select = 'SELECT e.title, e.season, e.episode, s.name as showname, s.id as showid,';
        var from = 'FROM "' + Episodes.tableName + '" e, "' + models.Series.tableName + '" s';
        var where = '';

        if (typeof userid !== 'undefined') {
          userid = parseInt(userid);
          if (isNaN(userid)) {
            return;
          }
          select +=  ' EXTRACT(epoch FROM (age(e.airdate) - user_interval.episode_offset))/86400::int as age ';
          from += ', "' + models.TrackShow.tableName + '" t, (SELECT u.episode_offset FROM "' + models.User.tableName + '" u';
          where = ' WHERE u.id = ' + userid + ' LIMIT 1) as user_interval WHERE e.seriesid = s.id AND s.id = t.showid AND t.userid = ' + userid + ' AND age(e.airdate) <= (user_interval.episode_offset + interval \'1 day\') AND age(e.airdate) >= (user_interval.episode_offset - interval \'1 day\');'
        }
        else {
          select +=  ' EXTRACT(epoch FROM age(e.airdate))/86400::int as age ';
          where = ' WHERE e.seriesid = s.id AND age(e.airdate) <= interval \'1 days\' AND age(e.airdate) >= interval \'-1 days\';';
        }

        var query = select + from + where;
        return sequelize.query(query);
      }
    }
  });

	return Episodes;
};