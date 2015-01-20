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
         * @param {boolean=} keep_logged_in defines if the user is logged out after the session
         * @returns {HttpPromise} HttpPromise
         */
        login: function (username, password, keep_logged_in) {
            if (typeof keep_logged_in === 'undefined') {
                keep_logged_in = false;
            }

            return $http.post('/api/login', {'username': username, 'password': password, 'keep_logged_in': keep_logged_in});
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
         * @param {string} captcha recaptcha's response
         * @returns {HttpPromise} HttpPromise
         */
        signup: function (username, password, captcha) {
            return $http.post('/api/signup', {'username': username, 'password': password, 'captcha': captcha});
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