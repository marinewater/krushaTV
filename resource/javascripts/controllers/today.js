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
krusha.controller('todayCtrl', ['$scope', '$filter', '$location', 'apiShowFactory', 'loggedinFactory', function($scope, $filter, $location, apiShowFactory, loggedinFactory) {
	var apiShow = new apiShowFactory();
	var loggedin = new loggedinFactory();
	
	$scope.$parent.title = 'New Episodes';
	$scope.loggedin = loggedin.getStatus();
	$scope.close_welcome = false;


	$scope.stopClick = function(event) {
		event.stopPropagation();
	};

	$scope.$on('loggedin', function() {
		getTodaysEpisodes();
		$scope.loggedin = loggedin.getStatus();
	});

	/**
	 * @ngdoc todayCtrl.method
	 * @name todayCtrl#close_info
	 * @description closes welcome info box
	 * @methodOf krushaTV.controllers:todayCtrl
	 */
	$scope.close_info = function() {
		$scope.close_welcome = true;
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
	 * @param {number} season season
	 */
	$scope.changeLocation = function(showid, season) {
		var url = '/show/' + showid;
		if (typeof season !== 'undefined') {
			url += '?season=' + season;
		}

		$location.url(url);
	};

	getTodaysEpisodes();
}]);