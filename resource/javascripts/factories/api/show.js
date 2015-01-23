/**
 * @ngdoc service
 * @name krushaTV.service:apiShow
 * @description Rest API calls for shows and episodes
 * @requires $http
 */
krusha.factory('apiShow', ['$http', function($http) {
    return {
        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#addShow
         * @description retrieves show information from an external api and stores it in the local database
         * @param {number} showid remote show id
         * @returns {HttpPromise} HttpPromise
         */
        addShow: function (showid) {
            return $http.post('/api/show/', {'showid': showid});
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#getShow
         * @description gets show information from local database
         * @param {number} showid local show id
         * @returns {HttpPromise} HttpPromise
         */
        getShow: function (showid) {
            return $http.get('/api/show/' + showid);
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#getSeasons
         * @description gets seasons for particular show
         * @param {number} showid local show id
         * @returns {HttpPromise} HttpPromise
         */
        getSeasons: function (showid) {
            return $http.get('/api/show/' + showid + '/season');
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#getEpisodes
         * @description gets episodes for particular show
         * @param {number} showid local show id
         * @param {number} season_nr season number
         * @returns {HttpPromise} HttpPromise
         */
        getEpisodes: function (showid, season_nr) {
            return $http.get('/api/show/' + showid + '/season/' + season_nr + '/episodes');
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#getTracked
         * @description gets all shows the user is tracking
         * @returns {HttpPromise} HttpPromise
         */
        getTracked: function () {
            return $http.get('/api/track');
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#addTracked
         * @description adds show to tracked shows
         * @param {number} showid local show id
         * @returns {HttpPromise} HttpPromise
         */
        addTracked: function (showid) {
            return $http.post('/api/track', {'showid': showid});
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#deleteTracked
         * @description removes show to tracked shows
         * @param {number} showid local show id
         * @returns {HttpPromise} HttpPromise
         */
        deleteTracked: function (showid) {
            return $http.delete('/api/track/' + showid);
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#watchedEpisode
         * @description marks an episode as watched
         * @param {number} episode_id episode id
         * @returns {HttpPromise} HttpPromise
         */
        watchedEpisode: function (episode_id) {
            return $http.post('/api/watched/episode', {'episodeid': episode_id});
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#notWatchedEpisode
         * @description marks an episode as unwatched
         * @param {number} episode_id episode id
         * @returns {HttpPromise} HttpPromise
         */
        notWatchedEpisode: function (episode_id) {
            return $http.delete('/api/watched/episode/' + episode_id);
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#getUnwatched
         * @description retrieves all unwatched episodes from tracked shows
         * @returns {HttpPromise} HttpPromise
         */
        getUnwatched: function () {
            return $http.get('/api/unwatched');
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#getWatched
         * @description retrieves all watched episodes from tracked shows
         * @returns {HttpPromise} HttpPromise
         */
        getWatched: function () {
            return $http.get('/api/watched');
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#markSeasonWatched
         * @description marks all episodes of a season of a particular show as watched
         * @param {number} showid local show id
         * @param {number} season_nr season number
         * @returns {HttpPromise} HttpPromise
         */
        markSeasonWatched: function (showid, season_nr) {
            return $http.post('/api/watched/season', {'showid': showid, 'season_nr': season_nr});
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#markShowWatched
         * @description marks all episodes of a particular show as watched
         * @param {number} showid local show id
         * @returns {HttpPromise} HttpPromise
         */
        markShowWatched: function (showid) {
            return $http.post('/api/watched/show', {'showid': showid});
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#markShowNotWatched
         * @description marks all episodes of a particular show as unwatched
         * @param {number} showid local show id
         * @returns {HttpPromise} HttpPromise
         */
        markShowNotWatched: function (showid) {
            return $http.delete('/api/watched/show/' + showid);
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#markSeasonNotWatched
         * @description marks all episodes of a season of a particular show as unwatched
         * @param {number} showid local show id
         * @param {number} season_nr season number
         * @returns {HttpPromise} HttpPromise
         */
        markSeasonNotWatched: function (showid, season_nr) {
            return $http.delete('/api/watched/season/' + showid + '/' + season_nr);
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#getTodaysEpisodes
         * @description
         * gets episodes from yesterday, today and tomorrow
         * if the user is loggedin, gets only episodes from tracked shows
         * @returns {HttpPromise} HttpPromise
         */
        getTodaysEpisodes: function () {
            return $http.get('/api/today');
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#getomdb
         * @description
         * gets imdb rating from omdb api
         * @param {string} imdb_id A valid IMDb ID (e.g. tt1285016)
         * @returns {HttpPromise} HttpPromise
         */
        getomdb: function(imdb_id) {
            return $http.get('/api/omdb/' + imdb_id);
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#getUnwatchedShows
         * @description
         * gets shows with unwatched episodes from the api
         * @returns {HttpPromise} HttpPromise
         */
        getUnwatchedShows: function() {
            return $http.get('/api/unwatched/shows');
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#getUnwatchedSeasons
         * @description
         * gets seasons with unwatched episodes for specific show from the api
         * @param {Number} showid show id
         * @returns {HttpPromise} HttpPromise
         */
        getUnwatchedSeasons: function(showid) {
            return $http.get('/api/unwatched/shows/' + showid + '/seasons');
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#getUnwatchedEpisodes
         * @description
         * gets  unwatched episodes for specific show and season from the api
         * @param {Number} showid show id
         * @param {Number} season season number
         * @returns {HttpPromise} HttpPromise
         */
        getUnwatchedEpisodes: function(showid, season) {
            return $http.get('/api/unwatched/shows/' + showid + '/seasons/' + season + '/episodes');
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#getWatchedShows
         * @description
         * gets shows with watched episodes from the api
         * @returns {HttpPromise} HttpPromise
         */
        getWatchedShows: function() {
            return $http.get('/api/watched/shows');
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#getWatchedSeasons
         * @description
         * gets seasons with watched episodes for specific show from the api
         * @param {Number} showid show id
         * @returns {HttpPromise} HttpPromise
         */
        getWatchedSeasons: function(showid) {
            return $http.get('/api/watched/shows/' + showid + '/seasons');
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#getWatchedEpisodes
         * @description
         * gets  watched episodes for specific show and season from the api
         * @param {Number} showid show id
         * @param {Number} season season number
         * @returns {HttpPromise} HttpPromise
         */
        getWatchedEpisodes: function(showid, season) {
            return $http.get('/api/watched/shows/' + showid + '/seasons/' + season + '/episodes');
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#getEpisodesMonth
         * @description
         * gets all tracked episodes for the specified month
         * @param {Number} month month
         * @param {Number} year year
         * @returns {HttpPromise} HttpPromise
         */
        getEpisodesMonth: function(month, year) {
            return $http.get('/api/calendar/' + year + '/' + month);
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#getEpisodesWeek
         * @description
         * gets all tracked episodes for the week the specified date is in
         * @param {Number} day day
         * @param {Number} month month
         * @param {Number} year year
         * @returns {HttpPromise} HttpPromise
         */
        getEpisodesWeek: function(day, month, year) {
            return $http.get('/api/calendar/' + year + '/' + month + '/' + day + '/week');
        },

        /**
         * @ngdoc apiShow.method
         * @methodOf krushaTV.service:apiShow
         * @name apiShow#getEpisodesDay
         * @description
         * gets all tracked episodes for the specified day
         * @param {Number} day day
         * @param {Number} month month
         * @param {Number} year year
         * @returns {HttpPromise} HttpPromise
         */
        getEpisodesDay: function(day, month, year) {
            return $http.get('/api/calendar/' + year + '/' + month + '/' + day);
        }
    }
}]);