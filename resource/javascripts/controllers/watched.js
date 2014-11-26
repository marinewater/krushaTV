/**
 * @ngdoc controller
 * @name krushaTV.controllers:watchtedCtrl
 * @description
 * Controller for watched.html template
 * @requires $scope
 * @requires $cookies
 * @requires krushaTV.service:apiShow
 * @requires krushaTV.service:parse
 */
krusha.controller('watchtedCtrl', ['$scope', '$cookies', 'apiShow', 'parse', function($scope, $cookies, apiShow, parse) {
	$scope.$parent.title = 'Watched Episodes';
	$scope.shows = [];

	/**
	 * @ngdoc watchtedCtrl.method
	 * @name watchtedCtrl#getWatched
	 * @description gets shows and episodes which the user has already watched and parses them
	 * @methodOf krushaTV.controllers:watchtedCtrl
	 */
	var getWatched = function() {
		apiShow.getWatched().success(function(data) {
			parse.unwatched(data, $scope.shows);
		});
	};

	/**
	 * @ngdoc watchtedCtrl.method
	 * @name watchtedCtrl#markEpisodeNotWatched
	 * @description marks an episode as unwatched
	 * @methodOf krushaTV.controllers:watchtedCtrl
	 * @param {object} episode episode object
	 * @param {object} season season object
	 * @param {object} show show object
	 */
	$scope.markEpisodeNotWatched = function(episode, season, show) {
		apiShow.notWatchedEpisode(episode.episodeid).success(function() {
			parse.watchedEpisode($scope.shows, episode, season, show);
		});
	};

	/**
	 * @ngdoc watchtedCtrl.method
	 * @name watchtedCtrl#markSeasonNotWatched
	 * @description marks all episodes of a season as unwatched
	 * @methodOf krushaTV.controllers:watchtedCtrl
	 * @param {object} season season object
	 * @param {object} show show object
	 */
	$scope.markSeasonNotWatched = function(season, show) {
		apiShow.markSeasonNotWatched(season.season, show.showid).success(function() {
			parse.watchedSeason($scope.shows, season, show);
		});
	};

	/**
	 * @ngdoc watchtedCtrl.method
	 * @name watchtedCtrl#markShowNotWatched
	 * @description marks all episodes of a show as watched
	 * @methodOf krushaTV.controllers:watchtedCtrl
	 * @param {object} show show object
	 */
	$scope.markShowNotWatched = function(show) {
		apiShow.markShowNotWatched(show.showid).success(function() {
			parse.watchedShow($scope.shows, show);
		});
	};

	/**
	 * @ngdoc watchtedCtrl.method
	 * @name watchtedCtrl#getTracked
	 * @description gets the user's tracked shows
	 * @methodOf krushaTV.controllers:watchtedCtrl
	 */
	var getTracked = function() {
		apiShow.getTracked().success(function(data) {
			data.shows.forEach(function(show) {
				$scope.shows.push({
					'name': show.name,
					'seasons': [],
					'showid': show.id
				});
			});
			getWatched();
		});
	};

	getTracked();
}]);