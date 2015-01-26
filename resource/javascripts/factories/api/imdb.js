/**
 * @ngdoc service
 * @name krushaTV.service:apiImdbFactory
 * @description IMDb api
 * @requires $http
 */
krusha.factory('apiImdbFactory', ['$http', function($http) {
    var apiImdb = function() {};

    /**
     * @ngdoc apiImdbFactory.method
     * @methodOf krushaTV.service:apiImdbFactory
     * @name apiImdbFactory#submitIMDbId
     * @description a user can submit an imdb id if none has been accepted yet, an admin will need to verify it
     * @param {string} imdb_id imdb id (e.g. tt1234567 or http://www.imdb.com/title/tt1234567/)
     * @param {string} show_id local show id for the submitted subreddit
     * @returns {HttpPromise} HttpPromise
     */
    apiImdb.prototype.submitIMDbId = function (imdb_id, show_id) {
        return $http.post('/api/imdb', {'imdb_id': imdb_id, 'showid': show_id});
    };

    /**
     * @ngdoc apiImdbFactory.method
     * @methodOf krushaTV.service:apiImdbFactory
     * @name apiImdbFactory#getSubmittedIMDbIds
     * @description gets all submitted imdb ids, needs admin permissions
     * @returns {HttpPromise} HttpPromise
     */
    apiImdb.prototype.getSubmittedIMDbIds = function () {
        return $http.get('/api/admin/imdb');
    };

    /**
     * @ngdoc apiImdbFactory.method
     * @methodOf krushaTV.service:apiImdbFactory
     * @name apiImdbFactory#acceptSubmittedIMDbID
     * @description accepts a user submission for a imdb id;
     * once a submission is accepted, all submitted imdb ids for this show will be deleted
     * @param {number} submission_id unique id for the imdb id that will be accepted
     * @returns {HttpPromise} HttpPromise
     */
    apiImdb.prototype.acceptSubmittedIMDbID = function (submission_id) {
        return $http.put('/api/admin/imdb/' + submission_id);
    };
    
    return apiImdb;
}]);