/**
 * @ngdoc controller
 * @name krushaTV.controllers:unwatchtedCtrl
 * @description
 * Controller for unwatched.html template
 * @requires $scope
 * @requires $cookies
 * @requires krushaTV.service:apiShow
 * @requires krushaTV.service:parse
 */
krusha.controller('unwatchtedCtrl', ['$scope', 'apiShow', function($scope, apiShow) {
	$scope.$parent.title = 'Unwatched Episodes';

	$scope.shows = [];

	var getUnwatchedShows = function() {
		apiShow.getUnwatchedShows().success(function(data) {
			$scope.shows = data.shows;
			$scope.shows[0].active = true;
			$scope.seasons = data.seasons;
			$scope.seasons[0].active = true;
			$scope.episodes = data.episodes;
		});
	};

	getUnwatchedShows();
}]);