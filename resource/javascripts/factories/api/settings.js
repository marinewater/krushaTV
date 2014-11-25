/**
 * @ngdoc service
 * @name krushaTV.service:apiSettings
 * @description Rest API calls for user settings and profile
 * @requires $http
 */
krusha.factory('apiSettings', ['$http', function($http) {
    return {
        /**
         * @ngdoc apiSettings.method
         * @name apiSettings#setEpisodeOffset
         * @description sends a http request to change the episode offset
         * @methodOf krushaTV.service:apiSettings
         * @param {number} days difference in days the user wants to be notified of new episodes, negative if the user wants to be notified before the episode is aired
         * @param {number} hours difference in hours the user wants to be notified of new episodes, negative if the user wants to be notified before the episode is aired
         * @returns {HttpPromise} HttpPromise
         */
        setEpisodeOffset: function(days, hours) {
            return $http.put('/api/profile/settings/episode-offset', {'offset': { 'days': days, 'hours': hours }});
        },

        /**
         * @ngdoc apiSettings.method
         * @name apiSettings#getProfile
         * @description gets the complete user profile
         * @methodOf krushaTV.service:apiSettings
         * @returns {HttpPromise} HttpPromise
         */
        getProfile: function () {
            return $http.get('/api/profile');
        }
    }
}]);