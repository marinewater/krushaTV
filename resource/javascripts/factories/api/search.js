/**
 * @ngdoc service
 * @name krushaTV.service:apiSearch
 * @description Rest API calls for searching shows
 * @requires $http
 * @requires $q
 */
krusha.factory('apiSearch', ['$http', '$q', function($http, $q) {
    return {
        /**
         * @ngdoc apiSearch.method
         * @methodOf krushaTV.service:apiSearch
         * @name apiSearch#searchLocal
         * @description searches through local database
         * @param {string} search_input search text, e.g. *Firefly*
         * @returns {HttpPromise} HttpPromise
         */
        searchLocal: function (search_input) {
            if (search_input.length >= 2) {
                return $http.get('/api/search/' + search_input, {cache: true}).then(function (data) {
                    return data;
                });
            }
            else {
                var deferred = $q.defer();
                deferred.reject(false);
                return deferred.promise;
            }
        },

        /**
         * @ngdoc apiSearch.method
         * @methodOf krushaTV.service:apiSearch
         * @name apiSearch#searchRemote
         * @description searches through external api
         * @param {string} search_input search text, e.g. *Firefly*
         * @returns {HttpPromise} HttpPromise
         */
        searchRemote: function (search_input) {
            search_input = search_input.trim();
            if (search_input.length >= 3) {
                return $http.get('/api/search/' + search_input + '/remote', {
                    cache: true,
                    timeout: 10000
                }).then(function (data) {
                    return data;
                });
            }
            else {
                var deferred = $q.defer();
                deferred.reject(false);
                return deferred.promise;
            }
        }
    }
}]);