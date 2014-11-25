/**
 * @ngdoc service
 * @name krushaTV.service:apiLogin
 * @description Rest API calls for authentication
 * @requires $http
 */
krusha.factory('apiAuth', ['$http', function($http) {
    return {
        /**
         * @ngdoc apiLogin.method
         * @methodOf krushaTV.service:apiLogin
         * @name apiLogin#login
         * @description logs an user in with the provided credentials
         * @param {string} username username
         * @param {string} password password (has to be at least 6 characters long)
         * @returns {HttpPromise} HttpPromise
         */
        login: function (username, password) {
            return $http.post('/api/login', {'username': username, 'password': password});
        },

        /**
         * @ngdoc apiLogin.method
         * @methodOf krushaTV.service:apiLogin
         * @name apiLogin#logout
         * @description logs an user out
         * @returns {HttpPromise} HttpPromise
         */
        logout: function () {
            return $http.get('/api/logout');
        },

        /**
         * @ngdoc apiLogin.method
         * @methodOf krushaTV.service:apiLogin
         * @name apiLogin#signup
         * @description registers a new user
         * @param {string} username username
         * @param {string} password password (has to be at least 6 characters long)
         * @returns {HttpPromise} HttpPromise
         */
        signup: function (username, password) {
            return $http.post('/api/signup', {'username': username, 'password': password});
        },

        /**
         * @ngdoc apiLogin.method
         * @methodOf krushaTV.service:apiLogin
         * @name apiLogin#loginStatus
         * @description check if a user is logged in or logged out
         * @returns {HttpPromise} HttpPromise
         */
        loginStatus: function () {
            return $http.get('/api/status');
        }
    }
}]);