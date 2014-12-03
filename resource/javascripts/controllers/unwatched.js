/**
 * @ngdoc controller
 * @name krushaTV.controllers:unwatchedCtrl
 * @description
 * Controller for unwatched.html template
 * @requires $scope
 * @requires $cookies
 * @requires krushaTV.service:apiShow
 * @requires krushaTV.service:parse
 */
krusha.controller('unwatchedCtrl', ['$scope', '$filter', 'apiShow', function($scope, $filter, apiShow) {
	$scope.$parent.title = 'Unwatched Episodes';
	$scope.watched = false;


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

	/**
	 * @ngdoc unwatchedCtrl.method
	 * @name unwatchedCtrl#markEpisodeWatched
	 * @description marks an episode as watched
	 * @methodOf krushaTV.controllers:unwatchedCtrl
	 * @param {object} episode episode object
	 */
	$scope.markEpisodeWatched = function(episode) {
		apiShow.watchedEpisode(episode.id).success(function() {
			$scope.episodes.splice($scope.episodes.indexOf(episode), 1);

			if ($scope.episodes.length === 0) {
				var season = $scope.seasons.find(function(season) {
					return !!season.active;
				});

				$scope.seasons.splice($scope.seasons.indexOf(season), 1);

				var show = $scope.shows.find(function(show) {
					return !!show.active;
				});

				if ($scope.seasons.length > 0) {
					$scope.getUnwatchedEpisodes(show.id, $scope.seasons[0].season)
				}
				else {
					$scope.shows.splice($scope.shows.indexOf(show), 1);

					if ($scope.shows.length > 0) {
						$scope.getUnwatchedSeasons($filter('orderByName')($scope.shows)[0].id);
					}
				}
			}
		});
	};

	/**
	 * @ngdoc unwatchedCtrl.method
	 * @name unwatchedCtrl#markSeasonWatched
	 * @description marks a season as watched
	 * @methodOf krushaTV.controllers:unwatchedCtrl
	 */
	$scope.markSeasonWatched = function() {
		var season_index = $scope.seasons.findIndex(function(season) {
			return !!season.active;
		});

		var show_index = $scope.shows.findIndex(function(show) {
			return !!show.active;
		});

		var showid = $scope.shows[show_index].id;
		var season_nr = $scope.seasons[season_index].season;

		apiShow.markSeasonWatched(showid, season_nr).success(function() {

			$scope.seasons.splice(season_index, 1);

			if ($scope.seasons.length > 0) {
				$scope.getUnwatchedEpisodes(showid, $scope.seasons[0].season)
			}
			else {
				$scope.shows.splice(show_index, 1);

				if ($scope.shows.length > 0) {
					$scope.getUnwatchedSeasons($filter('orderByName')($scope.shows)[0].id);
				}
			}
		});
	};

	/**
	 * @ngdoc unwatchedCtrl.method
	 * @name unwatchedCtrl#markShowWatched
	 * @description marks a show as watched
	 * @methodOf krushaTV.controllers:unwatchedCtrl
	 */
	$scope.markShowWatched = function() {
		var show_index = $scope.shows.findIndex(function(show) {
			return !!show.active;
		});

		var showid = $scope.shows[show_index].id;

		apiShow.markShowWatched(showid).success(function() {
				$scope.shows.splice(show_index, 1);

				if ($scope.shows.length > 0) {
					$scope.getUnwatchedSeasons($filter('orderByName')($scope.shows)[0].id);
				}
		});
	};

	getUnwatchedShows();
}]);