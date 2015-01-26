/**
 * @ngdoc service
 * @name krushaTV.service:loggedinFactory
 * @description handles user authentication
 * @requires $rootScope
 */

krusha.factory('loggedinFactory', ['$rootScope', function($rootScope) {
    /**
     * true: user is authenticated
     * @type {boolean}
     */
    var loggedin = false;

    /**
     * username if user is logged in, else null
     * @type {null|String}
     */
    var user = null;

    /**
     * how to display dates
     * @type {string}
     */
    var dateFormat = 'yyyy-MM-dd';

    var loggedinClass = function() {};

    /**
     * @ngdoc loggedinFactory.method
     * @methodOf krushaTV.service:loggedinFactory
     * @name loggedinFactory#getStatus
     * @description gets the user's authentication status
     * @return {Boolean} loggedin
     */
    loggedinClass.prototype.getStatus = function() {
        return loggedin;
    };

    /**
     * @ngdoc loggedinFactory.method
     * @methodOf krushaTV.service:loggedinFactory
     * @name loggedinFactory#setStatus
     * @description gets the user's authentication status
     * @param {Boolean} status sets the user's authentication status; true: user is logged in
     */
    loggedinClass.prototype.setStatus = function(status) {
        loggedin = status;
        $rootScope.$broadcast('loggedin');
    };

    /**
     * @ngdoc loggedinFactory.method
     * @methodOf krushaTV.service:loggedinFactory
     * @name loggedinFactory#setUser
     * @description sets the username
     * @param {String} username username
     */
    loggedinClass.prototype.setUser = function(username) {
        user = username;
    };

    /**
     * @ngdoc loggedinFactory.method
     * @methodOf krushaTV.service:loggedinFactory
     * @name loggedinFactory#getUser
     * @description returns username
     * @return {String} user
     */
    loggedinClass.prototype.getUser = function() {
        return user;
    };

    /**
     * @ngdoc loggedinFactory.method
     * @methodOf krushaTV.service:loggedinFactory
     * @name loggedinFactory#getDateFormat
     * @description returns date format
     * @return {String} date format
     */
    loggedinClass.prototype.getDateFormat = function() {
        return dateFormat;
    };

    /**
     * @ngdoc loggedinFactory.method
     * @methodOf krushaTV.service:loggedinFactory
     * @name loggedinFactory#setDateFormat
     * @description sets the date format
     * @param {String} format date format
     */
    loggedinClass.prototype.setDateFormat = function(format) {
        if (format)
            dateFormat = format;
        else
            dateFormat = 'yyyy-MM-dd';
    };
    
    return loggedinClass;
}]);