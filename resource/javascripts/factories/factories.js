/**
 * @ngdoc service
 * @name krushaTV.service:search_text
 * @description stores a user's search query
 */
krusha.service('search_text', [function () {
    /**
     * search query
     * @type {null|string}
     */
    var search = null;

    return {
        /**
         * @ngdoc search_text.method
         * @methodOf krushaTV.service:search_text
         * @name search_text#getText
         * @description retrieves stored search query
         * @returns {null|string} search query
         */
        getText: function () {
            return search
        },

        /**
         * @ngdoc search_text.method
         * @methodOf krushaTV.service:search_text
         * @name search_text#setText
         * @description returns stored search query
         * @param {null|string} value search query
         */
        setText: function(value) {
            search = value;
        }
    };
}]);

/**
 * @ngdoc service
 * @name krushaTV.service:redirect
 * @description stores the last known url and redirects back to it after logging in
 * @requires $location
 */
krusha.factory('redirect', ['$location', function($location) {
    /**
     * last known location/url before login
     * @type {null|string}
     */
    var last_location = null;

    /**
     * @ngdoc redirect.method
     * @methodOf krushaTV.service:redirect
     * @name redirect#login
     * @description stores the current location and redirects to the login page
     */
    return {
        login: function() {
            last_location = $location.path();
            $location.path('/login');
        },

        /**
         * @ngdoc redirect.method
         * @methodOf krushaTV.service:redirect
         * @name redirect#back
         * @description redirects to the last known location
         */
        back: function() {
            if (last_location != null && last_location != '/login') {
                $location.path(last_location);
            }
            else {
                $location.path('/');
            }
        }
    }
}]);

/**
 * @ngdoc service
 * @name krushaTV.service:interceptor
 * @description checks every $http request for an 401 Unauthenticated error and redirects to the login page if the user is not authenticated
 * @requires $q
 * @requires krushaTV.service:loggedin
 * @requires krushaTV.service:redirect
 * @requires krushaTV.service:notifications
 */
krusha.factory('interceptor', ['$q', 'loggedin', 'redirect', 'notifications', function($q, loggedin, redirect, notifications) {
    var rateLimitGone = null;
    var lastRateLimitNotificationShown = null;

    return {
        /**
         * @ngdoc interceptor.method
         * @methodOf krushaTV.service:interceptor
         * @name interceptor#response
         * @description does nothing
         * @param {object} response response
         * @returns {object} response
         */
        response: function(response) {
            return response;
        },

        /**
         * @ngdoc interceptor.method
         * @methodOf krushaTV.service:interceptor
         * @name interceptor#responseError
         * @description checks every $http request for an 401 Unauthenticated error and redirects to the login page if the user is not authenticated
         * @param {object} response response
         * @returns {Promise} promise
         */
        responseError: function(response) {
            // handle unauthorized users' requests to resources where a login is required
            if (response.status === 401) {
                loggedin.setStatus(false);

                if (!('login' in response.data)) {
                    redirect.login();
                }
            }

            // handle rate limiting
            if (response.status === 429) {
                if (rateLimitGone === null || rateLimitGone < Date.parse(response.data.error.nextValidRequestDate) || lastRateLimitNotificationShown + 5000 < Date.now()) {
                    rateLimitGone = Date.parse(response.data.error.nextValidRequestDate);
                    var timeTillNextRequest = Math.floor((rateLimitGone - Date.now()) / 1000); // in seconds

                    var minutes = Math.floor(timeTillNextRequest / 60);
                    var seconds = timeTillNextRequest - minutes * 60;

                    var message = 'You made to many requests. You can make next request in ';

                    message += minutes > 0 ? minutes + ' minutes and ' : '';
                    message += seconds + ' seconds.';

                    lastRateLimitNotificationShown = Date.now();

                    notifications.add(message, 'danger', 5000, true);
                }
            }

            return $q.reject(response);
        }
    };
}]);