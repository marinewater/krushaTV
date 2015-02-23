/**
 * @ngdoc service
 * @name krushaTV.service:apiShowFactory
 * @description Rest API calls for shows and episodes
 * @requires $http
 */
krusha.factory('apiShowFactory', ['$http', function($http) {
    var apiShow = function() {};

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#addShow
     * @description retrieves show information from an external api and stores it in the local database
     * @param {number} showid remote show id
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.addShow = function (showid) {
        return $http.post('/api/show/', {'showid': showid}, {timeout: 120000});
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#getShow
     * @description gets show information from local database
     * @param {number} showid local show id
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.getShow = function (showid) {
        return $http.get('/api/show/' + showid);
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#getSeasons
     * @description gets seasons for particular show
     * @param {number} showid local show id
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.getSeasons = function (showid, season) {
        if (typeof season === 'undefined') {
            return $http.get('/api/show/' + showid + '/season');
        }
        else {
            return $http.get('/api/show/' + showid + '/season/' + season);
        }
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#getEpisodes
     * @description gets episodes for particular show
     * @param {number} showid local show id
     * @param {number} season_nr season number
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.getEpisodes = function (showid, season_nr) {
        return $http.get('/api/show/' + showid + '/season/' + season_nr + '/episodes');
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#getTracked
     * @description gets all shows the user is tracking
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.getTracked = function () {
        return $http.get('/api/track');
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#addTracked
     * @description adds show to tracked shows
     * @param {number} showid local show id
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.addTracked = function (showid) {
        return $http.post('/api/track', {'showid': showid});
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#deleteTracked
     * @description removes show to tracked shows
     * @param {number} showid local show id
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.deleteTracked = function (showid) {
        return $http.delete('/api/track/' + showid);
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#watchedEpisode
     * @description marks an episode as watched
     * @param {number} episode_id episode id
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.watchedEpisode = function (episode_id) {
        return $http.post('/api/watched/episode', {'episodeid': episode_id});
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#notWatchedEpisode
     * @description marks an episode as unwatched
     * @param {number} episode_id episode id
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.notWatchedEpisode = function (episode_id) {
        return $http.delete('/api/watched/episode/' + episode_id);
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#getUnwatched
     * @description retrieves all unwatched episodes from tracked shows
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.getUnwatched = function () {
        return $http.get('/api/unwatched');
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#getWatched
     * @description retrieves all watched episodes from tracked shows
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.getWatched = function () {
        return $http.get('/api/watched');
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#markSeasonWatched
     * @description marks all episodes of a season of a particular show as watched
     * @param {number} showid local show id
     * @param {number} season_nr season number
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.markSeasonWatched = function (showid, season_nr) {
        return $http.post('/api/watched/season', {'showid': showid, 'season_nr': season_nr});
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#markShowWatched
     * @description marks all episodes of a particular show as watched
     * @param {number} showid local show id
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.markShowWatched = function (showid) {
        return $http.post('/api/watched/show', {'showid': showid});
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#markShowNotWatched
     * @description marks all episodes of a particular show as unwatched
     * @param {number} showid local show id
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.markShowNotWatched = function (showid) {
        return $http.delete('/api/watched/show/' + showid);
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#markSeasonNotWatched
     * @description marks all episodes of a season of a particular show as unwatched
     * @param {number} showid local show id
     * @param {number} season_nr season number
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.markSeasonNotWatched = function (showid, season_nr) {
        return $http.delete('/api/watched/season/' + showid + '/' + season_nr);
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#getTodaysEpisodes
     * @description
     * gets episodes from yesterday, today and tomorrow
     * if the user is loggedin, gets only episodes from tracked shows
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.getTodaysEpisodes = function () {
        return $http.get('/api/today');
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#getomdb
     * @description
     * gets imdb rating from omdb api
     * @param {string} imdb_id A valid IMDb ID (e.g. tt1285016)
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.getomdb = function(imdb_id) {
        return $http.get('/api/omdb/' + imdb_id);
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#getUnwatchedShows
     * @description
     * gets shows with unwatched episodes from the api
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.getUnwatchedShows = function() {
        return $http.get('/api/unwatched/shows');
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#getUnwatchedSeasons
     * @description
     * gets seasons with unwatched episodes for specific show from the api
     * @param {Number} showid show id
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.getUnwatchedSeasons = function(showid) {
        return $http.get('/api/unwatched/shows/' + showid + '/seasons');
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#getUnwatchedEpisodes
     * @description
     * gets  unwatched episodes for specific show and season from the api
     * @param {Number} showid show id
     * @param {Number} season season number
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.getUnwatchedEpisodes = function(showid, season) {
        return $http.get('/api/unwatched/shows/' + showid + '/seasons/' + season + '/episodes');
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#getWatchedShows
     * @description
     * gets shows with watched episodes from the api
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.getWatchedShows = function() {
        return $http.get('/api/watched/shows');
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#getWatchedSeasons
     * @description
     * gets seasons with watched episodes for specific show from the api
     * @param {Number} showid show id
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.getWatchedSeasons = function(showid) {
        return $http.get('/api/watched/shows/' + showid + '/seasons');
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#getWatchedEpisodes
     * @description
     * gets  watched episodes for specific show and season from the api
     * @param {Number} showid show id
     * @param {Number} season season number
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.getWatchedEpisodes = function(showid, season) {
        return $http.get('/api/watched/shows/' + showid + '/seasons/' + season + '/episodes');
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#getEpisodesMonth
     * @description
     * gets all tracked episodes for the specified month
     * @param {Number} month month
     * @param {Number} year year
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.getEpisodesMonth = function(month, year) {
        return $http.get('/api/calendar/' + year + '/' + month);
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#getEpisodesWeek
     * @description
     * gets all tracked episodes for the week the specified date is in
     * @param {Number} day day
     * @param {Number} month month
     * @param {Number} year year
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.getEpisodesWeek = function(day, month, year) {
        return $http.get('/api/calendar/' + year + '/' + month + '/' + day + '/week');
    };

    /**
     * @ngdoc apiShowFactory.method
     * @methodOf krushaTV.service:apiShowFactory
     * @name apiShowFactory#getEpisodesDay
     * @description
     * gets all tracked episodes for the specified day
     * @param {Number} day day
     * @param {Number} month month
     * @param {Number} year year
     * @returns {HttpPromise} HttpPromise
     */
    apiShow.prototype.getEpisodesDay = function(day, month, year) {
        return $http.get('/api/calendar/' + year + '/' + month + '/' + day);
    };
    
    return apiShow;
}]);