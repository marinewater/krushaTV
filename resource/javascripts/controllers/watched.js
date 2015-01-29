/**
 * @ngdoc controller
 * @name krushaTV.controllers:watchedCtrl
 * @description
 * Controller for watched.html template
 * @requires $scope
 * @requires $filter
 * @requires krushaTV.service:apiShowFactory
 */
krusha.controller('watchedCtrl', ['$scope', '$filter', 'apiShowFactory', function($scope, $filter, apiShowFactory) {
	var apiShow = new apiShowFactory();
	
	/**
	 * set title of html page
	 * @type {string}
	 */
	$scope.$parent.title = 'Watched Episodes';
	/**
	 * needed to set correct wording in directive
	 * @type {boolean}
	 */
	$scope.watched = true;


	/**
	 * @ngdoc watchedCtrl.method
	 * @name watchedCtrl#getWatchedShows
	 * @description retrieves watched shows from api
	 * @methodOf krushaTV.controllers:watchedCtrl
	 */
	var getWatchedShows = function() {
		apiShow.getWatchedShows().success(function(data) {
			$scope.shows = data.shows;
			$scope.shows[0].active = true;
			$scope.seasons = data.seasons;
			$scope.seasons[0].active = true;
			$scope.episodes = data.episodes;
		});
	};

	/**
	 * @ngdoc watchedCtrl.method
	 * @name watchedCtrl#getWatchedSeasons
	 * @description retrieves watched seasons from api
	 * @methodOf krushaTV.controllers:watchedCtrl
	 * @param {Number} showid id of the show to retrieve seasons from
	 */
	$scope.getWatchedSeasons = function(showid) {
		apiShow.getWatchedSeasons(showid).success(function(data) {
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

	/**
	 * @ngdoc watchedCtrl.method
	 * @name watchedCtrl#getWatchedEpisodes
	 * @description retrieves watched episodes from api
	 * @methodOf krushaTV.controllers:watchedCtrl
	 * @param {Number} showid id of the show to retrieve episodes from
	 * @param {Number} season_nr number of the season to retrieve seasons from
	 */
	$scope.getWatchedEpisodes = function(showid, season_nr) {
		apiShow.getWatchedEpisodes(showid, season_nr).success(function(data) {
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
	 * @ngdoc watchedCtrl.method
	 * @name watchedCtrl#markEpisodeWatched
	 * @description marks an episode as watched
	 * @methodOf krushaTV.controllers:watchedCtrl
	 * @param {object} episode episode object
	 */
	$scope.markEpisodeUnwatched = function(episode) {
		apiShow.notWatchedEpisode(episode.id).success(function() {
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
					$scope.getWatchedEpisodes(show.id, $scope.seasons[0].season)
				}
				else {
					$scope.shows.splice($scope.shows.indexOf(show), 1);

					if ($scope.shows.length > 0) {
						$scope.getWatchedSeasons($filter('orderByName')($scope.shows)[0].id);
					}
				}
			}
		});
	};

	/**
	 * @ngdoc watchedCtrl.method
	 * @name watchedCtrl#markSeasonNotWatched
	 * @description marks a season as unwatched
	 * @methodOf krushaTV.controllers:watchedCtrl
	 */
	$scope.markSeasonNotWatched = function() {
		var season_index = $scope.seasons.findIndex(function(season) {
			return !!season.active;
		});

		var show_index = $scope.shows.findIndex(function(show) {
			return !!show.active;
		});

		var showid = $scope.shows[show_index].id;
		var season_nr = $scope.seasons[season_index].season;

		apiShow.markSeasonNotWatched(showid, season_nr).success(function() {
			$scope.seasons.splice(season_index, 1);

			if ($scope.seasons.length > 0) {
				$scope.getWatchedEpisodes(showid, $scope.seasons[0].season)
			}
			else {
				$scope.shows.splice(show_index, 1);

				if ($scope.shows.length > 0) {
					$scope.getWatchedSeasons($filter('orderByName')($scope.shows)[0].id);
				}
			}
		});
	};

	/**
	 * @ngdoc watchedCtrl.method
	 * @name watchedCtrl#markShowNotWatched
	 * @description marks a show as watched
	 * @methodOf krushaTV.controllers:watchedCtrl
	 */
	$scope.markShowNotWatched = function() {
		var show_index = $scope.shows.findIndex(function(show) {
			return !!show.active;
		});

		var showid = $scope.shows[show_index].id;

		apiShow.markShowNotWatched(showid).success(function() {
			$scope.shows.splice(show_index, 1);

			if ($scope.shows.length > 0) {
				$scope.getWatchedSeasons($filter('orderByName')($scope.shows)[0].id);
			}
		});
	};

	getWatchedShows();
}]);