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
krusha.controller('unwatchtedCtrl', ['$scope', '$cookies', 'apiShow', 'parse', function($scope, $cookies, apiShow, parse) {
	$scope.shows = [];

	/**
	 * @ngdoc unwatchtedCtrl.method
	 * @name unwatchtedCtrl#getUnwatched
	 * @description gets shows and episodes which the user has not watched yet and parses them
	 * @methodOf krushaTV.controllers:unwatchtedCtrl
	 */
	var getUnwatched = function() {
		apiShow.getUnwatched().success(function(data) {
			parse.unwatched(data, $scope.shows);
		});
	};

	/**
	 * @ngdoc unwatchtedCtrl.method
	 * @name unwatchtedCtrl#getTracked
	 * @description gets the user's tracked shows
	 * @methodOf krushaTV.controllers:unwatchtedCtrl
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
			getUnwatched();
		});
	};

	/**
	 * @ngdoc unwatchtedCtrl.method
	 * @name unwatchtedCtrl#markEpisodeWatched
	 * @description marks an episode as watched
	 * @methodOf krushaTV.controllers:unwatchtedCtrl
	 * @param {object} episode episode object
	 * @param {object} season season object
	 * @param {object} show show object
	 */
	$scope.markEpisodeWatched = function(episode, season, show) {
		apiShow.watchedEpisode(episode.episodeid).success(function() {
			parse.watchedEpisode($scope.shows, episode, season, show);
		});
	};

	/**
	 * @ngdoc unwatchtedCtrl.method
	 * @name unwatchtedCtrl#markSeasonWatched
	 * @description marks all episodes of a season as watched
	 * @methodOf krushaTV.controllers:unwatchtedCtrl
	 * @param {object} season season object
	 * @param {object} show show object
	 */
	$scope.markSeasonWatched = function(season, show) {
		apiShow.markSeasonWatched(show.showid, season.season).success(function() {
			parse.watchedSeason($scope.shows, season, show);
		});
	};

	/**
	 * @ngdoc unwatchtedCtrl.method
	 * @name unwatchtedCtrl#markShowWatched
	 * @description marks all episodes of a show as watched
	 * @methodOf krushaTV.controllers:unwatchtedCtrl
	 * @param {object} show show object
	 */
	$scope.markShowWatched = function(show) {
		apiShow.markShowWatched(show.showid).success(function() {
			parse.watchedShow($scope.shows, show);
		});
	};

	getTracked();
}]);