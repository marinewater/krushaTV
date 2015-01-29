/**
 * @ngdoc service
 * @name krushaTV.service:interceptor
 * @description checks every $http request for an 401 Unauthenticated error and redirects to the login page if the user is not authenticated
 * @requires $q
 * @requires krushaTV.service:loggedinFactory
 * @requires krushaTV.service:redirect
 * @requires krushaTV.service:notificationsFactory
 */
krusha.factory('interceptor', ['$q', 'loggedinFactory', 'redirectFactory', 'notificationsFactory', function($q, loggedinFactory, redirectFactory, notificationsFactory) {
    var loggedin = new loggedinFactory();
    var redirect = new redirectFactory();
    var notifications = new notificationsFactory();
    
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
            else if (response.status === 429) {
                if (rateLimitGone === null || rateLimitGone < Date.parse(response.data.error.nextValidRequestDate) || lastRateLimitNotificationShown + 5000 < Date.now()) {
                    rateLimitGone = Date.parse(response.data.error.nextValidRequestDate);
                    var timeTillNextRequest = Math.floor((rateLimitGone - Date.now()) / 1000); // in seconds

                    var minutes = Math.floor(timeTillNextRequest / 60);
                    var seconds = timeTillNextRequest - minutes * 60;

                    var message = 'You made to many requests. You can make the next request in ';

                    message += minutes > 0 ? minutes + ' minutes and ' : '';
                    message += seconds + ' seconds.';

                    lastRateLimitNotificationShown = Date.now();

                    notifications.add(message, 'danger', 5000, true);
                }
            }
            
            else if (response.status === 503) {
                notifications.add(response.data.message, 'danger', 20000, true);
            }

            return $q.reject(response);
        }
    };
}]);