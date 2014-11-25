/**
 * @ngdoc controller
 * @name krushaTV.controllers:imdbCtrl
 * @description
 * Controller for admin/imdb.html template
 * displays user submissions for imdb_ids and lets admins accept them
 * needs admin permissions
 * @requires $scope
 * @requires krushaTV.service:apiImdb
 */
krusha.controller('imdbCtrl', ['$scope', 'apiImdb', function($scope, apiImdb) {
	/**
	 * @ngdoc imdbCtrl.method
	 * @name imdbCtrl#getIMDbIds
	 * @description gets all user submitted imdb_ids from the api
	 * @methodOf krushaTV.controllers:imdbCtrl
	 */
	var getIMDbIds = function() {
		apiImdb.getSubmittedIMDbIds().success(function(data) {
			$scope.imdb_ids = data.imdb_ids;
		}).error(function(err, code) {
			if (code === 404) {
				$scope.imdb_ids = null;
			}
		});
	};

	/**
	 * @ngdoc imdbCtrl.method
	 * @name imdbCtrl#acceptIMDbId
	 * @description accepts a user submission for a imdb id
	 * @methodOf krushaTV.controllers:imdbCtrl
	 * @param {number} submission_id unique id for the imdb id that will be accepted
	 */
	$scope.acceptIMDbId = function(submission_id) {
		apiImdb.acceptSubmittedIMDbID(submission_id).success(function() {
			getIMDbIds();
		});
	};

	getIMDbIds();
}]);