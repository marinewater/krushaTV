/**
 * @ngdoc service
 * @name krushaTV.service:apiSettingsFactory
 * @description Rest API calls for user settings and profile
 * @requires $http
 */
krusha.factory('apiSettingsFactory', ['$http', function($http) {
    var apiSettings = function() {};

    /**
     * @ngdoc apiSettingsFactory.method
     * @name apiSettingsFactory#setEpisodeOffset
     * @description sends a http request to change the episode offset
     * @methodOf krushaTV.service:apiSettingsFactory
     * @param {number} days difference in days the user wants to be notified of new episodes, negative if the user wants to be notified before the episode is aired
     * @param {number} hours difference in hours the user wants to be notified of new episodes, negative if the user wants to be notified before the episode is aired
     * @returns {HttpPromise} HttpPromise
     */
    apiSettings.prototype.setEpisodeOffset = function(days, hours) {
        return $http.put('/api/profile/settings/episode-offset', {'offset': { 'days': days, 'hours': hours }});
    };

    /**
     * @ngdoc apiSettingsFactory.method
     * @name apiSettingsFactory#getProfile
     * @description gets the complete user profile
     * @methodOf krushaTV.service:apiSettingsFactory
     * @returns {HttpPromise} HttpPromise
     */
    apiSettings.prototype.getProfile = function () {
        return $http.get('/api/profile');
    };

    /**
     * @ngdoc apiSettingsFactory.method
     * @name apiSettingsFactory#setDateFormat
     * @description sends a http request to change the date format
     * @methodOf krushaTV.service:apiSettingsFactory
     * @param {string} date_format the format dates should be displayed in
     * @returns {HttpPromise} HttpPromise
     */
    apiSettings.prototype.setDateFormat = function(date_format) {
        return $http.put('/api/profile/settings/date-format', {'date_format': date_format});
    };
    
    return apiSettings;
}]);