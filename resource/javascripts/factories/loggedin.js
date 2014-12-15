/**
 * @ngdoc service
 * @name krushaTV.service:loggedin
 * @description handles user authentication
 * @requires $rootScope
 */
krusha.factory('loggedin', ['$rootScope', function($rootScope) {
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

    return {
        /**
         * @ngdoc loggedin.method
         * @methodOf krushaTV.service:loggedin
         * @name loggedin#getStatus
         * @description gets the user's authentication status
         * @return {Boolean} loggedin
         */
        getStatus: function() {
            return loggedin;
        },

        /**
         * @ngdoc loggedin.method
         * @methodOf krushaTV.service:loggedin
         * @name loggedin#setStatus
         * @description gets the user's authentication status
         * @param {Boolean} status sets the user's authentication status; true: user is logged in
         */
        setStatus: function(status) {
            loggedin = status;
            $rootScope.$broadcast('loggedin');
        },

        /**
         * @ngdoc loggedin.method
         * @methodOf krushaTV.service:loggedin
         * @name loggedin#setUser
         * @description sets the username
         * @param {String} username username
         */
        setUser: function(username) {
            user = username;
        },

        /**
         * @ngdoc loggedin.method
         * @methodOf krushaTV.service:loggedin
         * @name loggedin#getUser
         * @description returns username
         * @return {String} user
         */
        getUser: function() {
            return user;
        },

        /**
         * @ngdoc loggedin.method
         * @methodOf krushaTV.service:loggedin
         * @name loggedin#getDateFormat
         * @description returns date format
         * @return {String} date format
         */
        getDateFormat: function() {
            return dateFormat;
        },

        /**
         * @ngdoc loggedin.method
         * @methodOf krushaTV.service:loggedin
         * @name loggedin#setDateFormat
         * @description sets the date format
         * @param {String} format date format
         */
        setDateFormat: function(format) {
            if (format)
                dateFormat = format;
            else
                dateFormat = 'yyyy-MM-dd';
        }
    }
}]);