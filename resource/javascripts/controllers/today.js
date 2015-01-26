/**
 * @ngdoc controller
 * @name krushaTV.controllers:todayCtrl
 * @description
 * Controller for homepage
 * displays yesterdays, todays and tomorrows episodes
 * if the user is logged in, shows only episodes of trakced shows
 * @requires $scope
 * @requires $filter
 * @requires $location
 * @requires krushaTV.service:apiShowFactory
 */
krusha.controller('todayCtrl', ['$scope', '$filter', '$location', 'apiShowFactory', function($scope, $filter, $location, apiShowFactory) {
	var apiShow = new apiShowFactory();
	
	$scope.$parent.title = 'New Episodes';


	$scope.stopClick = function(event) {
		event.stopPropagation();
	};
	/**
	 * @ngdoc todayCtrl.method
	 * @name todayCtrl#getTodaysEpisodes
	 * @description retrieves yesterdays, todays and tomorrows episodes from the api
	 * @methodOf krushaTV.controllers:todayCtrl
	 */
	var getTodaysEpisodes = function() {
		apiShow.getTodaysEpisodes().success(function(data) {
			$scope.todays_episodes = $filter('filter')(data.episodes, {'age': 0}, true);
			$scope.tomorrows_episodes = $filter('filter')(data.episodes, {'age': -1}, true);
			$scope.yesterdays_episodes = $filter('filter')(data.episodes, {'age': 1}, true);
		});
	};
	/**
	 * @ngdoc todayCtrl.method
	 * @name todayCtrl#changeLocation
	 * @description redirects the user to a show view
	 * @methodOf krushaTV.controllers:todayCtrl
	 * @param {number} showid local show id
	 */
	$scope.changeLocation = function(showid) {
		$location.path('show/' + showid);
	};

	getTodaysEpisodes();
}]);