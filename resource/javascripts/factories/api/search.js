/**
 * @ngdoc service
 * @name krushaTV.service:apiSearch
 * @description Rest API calls for searching shows
 * @requires $http
 * @requires $q
 */
krusha.factory('apiSearch', ['$http', '$q', 'loggedin', function($http, $q, loggedin) {
    return {
        /**
         * @ngdoc apiSearch.method
         * @methodOf krushaTV.service:apiSearch
         * @name apiSearch#searchLocal
         * @description searches through local database
         * @param {string} search_input search text, e.g. *Firefly*
         * @returns {HttpPromise|Promise} HttpPromise
         */
        searchLocal: function (search_input) {
            /**
             * cache search queries only if the user is not loggedin, because search results my change if the user tracks new shows
             * @type {boolean}
             */
            var cache = !loggedin.getStatus();

            /**
             * remove unnecessary whitespace
             * @type {string}
             */
            search_input = search_input.trim();

            if (search_input.length >= 2) {
                return $http.get('/api/search/' + search_input, {cache: cache}).then(function(data) {
                    return data;
                }, function(err) {
                    return $q(function(resolve, reject) {
                        return reject(err);
                    });
                });
            }
            else {
                return $q(function(resolve, reject) {
                    return reject({
                        'type': 'error',
                        'code': 400,
                        'message': 'Search query is too short.'
                    });
                });
            }
        },

        /**
         * @ngdoc apiSearch.method
         * @methodOf krushaTV.service:apiSearch
         * @name apiSearch#searchRemote
         * @description searches through external api
         * @param {string} search_input search text, e.g. *Firefly*
         * @returns {HttpPromise|Promise} HttpPromise
         */
        searchRemote: function (search_input) {
            /**
             * remove unnecessary whitespace
             * @type {string}
             */
            search_input = search_input.trim();

            if (search_input.length >= 3) {
                return $http.get('/api/search/' + search_input + '/remote', {
                    cache: true,
                    timeout: 120000
                }).then(function(data) {
                    return data;
                }, function(err) {
                    return $q(function(resolve, reject) {
                        return reject(err);
                    });
                });
            }
            else {
                return $q(function(resolve, reject) {
                    return reject({
                        'type': 'error',
                        'code': 400,
                        'message': 'Search query is too short.'
                    });
                });
            }
        }
    }
}]);