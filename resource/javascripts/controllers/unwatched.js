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

	$scope.getUnwatchedSeasons = function(showid) {
		apiShow.getUnwatchedSeasons(showid).success(function(data) {
			var active_show = $scope.shows.find(function(show) {
				return show.id === showid;
			});

			$scope.shows.forEach(function(show) {
				show.active = false;
			});

			active_show.active = true;

			$scope.seasons = data.seasons;
			$scope.seasons[0].active = true;
			$scope.episodes = data.episodes;
		});
	};

	$scope.getUnwatchedEpisodes = function(showid, season_nr) {
		apiShow.getUnwatchedEpisodes(showid, season_nr).success(function(data) {
			var active_season = $scope.seasons.find(function(season) {
				return season.season === season_nr;
			});

			$scope.seasons.forEach(function(season) {
				season.active = false;
			});

			active_season.active = true;

			$scope.episodes = data.episodes;
		})
	};

	getUnwatchedShows();
}]);