module.exports = function(log, models) {
    return {
        getEpisodes: function(show_id, user_id, season, callback) {
            var query = {
                where: {
                    seriesid: show_id,
                    season: season
                },
                attributes: ['id', 'title', 'airdate', 'episode'],
                order: ['episode']
            };

            user_id = parseInt(user_id);
            var user_id_exists = !isNaN(user_id);

            if (user_id_exists) {
                query.include = [{
                    model: models.WatchedEpisodes,
                    required: false,
                    where: {
                        'userid': user_id
                    },
                    attributes: ['id']
                }];
            }

            models.Episodes.findAll(query)
                .success(function(episode_results) {
                    if (episode_results.length > 0) {
                        var episodes = [];

                        episode_results.forEach(function(ep) {
                            var episode = ep.dataValues;

                            if (user_id_exists) {
                                var watched = false;

                                if (episode.WatchedEpisodes.length > 0) {
                                    watched = true;
                                }
                            }

                            var episode_object = {
                                'title': episode.title,
                                'episode': episode.episode,
                                'airdate': episode.airdate,
                                'id': episode.id
                            };

                            if (user_id_exists) {
                                episode_object.watched =watched;
                            }

                            episodes.push(episode_object);
                        });

                        callback(episodes);
                    }
                    else {
                        callback(null);
                    }
                })
                .error(function(err) {
                    log.error('module: getSeasons; function getEpisodes; DB: ' + err);
                    callback(false);
                });
        }
    };
};