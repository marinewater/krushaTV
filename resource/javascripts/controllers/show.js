/**
 * @ngdoc controller
 * @name krushaTV.controllers:showCtrl
 * @description
 * Controller for show.html template
 * @requires $scope
 * @requires $location
 * @requires krushaTV.service:apiAuth
 * @requires krushaTV.service:notifications
 * @requires krushaTV.service:redirect
 * @requires krushaTV.service:loggedin
 */
krusha.controller('showCtrl', ['$scope', '$routeParams', '$cookies', '$filter', '$timeout', 'apiShow', 'apiReddit', 'apiImdb', 'helpers', 'notifications', 'loggedin',
	function($scope, $routeParams, $cookies, $filter, $timeout, apiShow, apiReddit, apiImdb, helpers, notifications, loggedin) {
		$scope.show = {};
		$scope.seasons = {};
		$scope.tracked = null;
		$scope.reddit = [];
		$scope.showWatched = true;
		$scope.loggedin = loggedin.getStatus();
		$scope.submittedRedditText = false;
		$scope.submittedImdbId = false;
		var reddit_info = {};

		var oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
		var today = new Date();

		if ($cookies.oneAtATime === undefined) {
			$cookies.oneAtATime = true;
		}
		$scope.oneAtATime = $cookies.oneAtATime === 'true';

		

		$scope.$on('loggedin', function() {
			$scope.loggedin = loggedin.getStatus();
			getShow(showid);
			getEpisodes(showid);
			updateShowWatched();
		});

		/**
		 * @ngdoc showCtrl.method
		 * @name showCtrl#updateShowWatched
		 * @description updates setting that indicates if the user wants to see already watched episodes
		 * @methodOf krushaTV.controllers:showCtrl
		 */
		var updateShowWatched = function() {
			if ($cookies.showWatched !== undefined && $scope.loggedin === true) {
				$scope.showWatched = $cookies.showWatched === 'true';
			}
		};

		/**
		 * @ngdoc showCtrl.method
		 * @name showCtrl#omdb_get
		 * @description gets imdb rating
		 * @methodOf krushaTV.controllers:showCtrl
		 * @param {string} imdb_id A valid IMDb ID (e.g. tt1285016)
		 */
		var omdb_get = function(imdb_id) {
			apiShow.getomdb(imdb_id).success(function(data) {
				$scope.omdb = data;
			});
		};

		/**
		 * @ngdoc showCtrl.method
		 * @name showCtrl#reddit_get
		 * @description gets 5 hot threads from a subreddit
		 * @methodOf krushaTV.controllers:showCtrl
		 * @param {string} subreddit subreddit (e.g. /r/firefly)
		 */
		var reddit_get = function(subreddit) {
			apiReddit.subreddit(subreddit).success(function(data) {
				reddit_info.sub = subreddit;
				reddit_info.after = data.data.after;

				data.data.children.forEach(function(thread) {
					$scope.reddit.push(thread);
				});
			});
		};

		/**
		 * @ngdoc showCtrl.method
		 * @name showCtrl#nextFive
		 * @description gets the next 5 reddit threads, needs an "after" string from a previous request
		 * @methodOf krushaTV.controllers:showCtrl
		 */
		$scope.nextFive = function() {
			apiReddit.reddit5more(reddit_info.sub, reddit_info.after).success(function(data) {
				reddit_info.after = data.data.after;
				data.data.children.forEach(function(thread) {
					$scope.reddit.push(thread);
				});
			});
		};

		/**
		 * @ngdoc showCtrl.method
		 * @name showCtrl#getShow
		 * @description gets show information from api
		 * @methodOf krushaTV.controllers:showCtrl
		 * @param {number} show_id local show id
		 */
		var getShow = function(show_id) {
			apiShow.getShow(show_id)
				.success(function(data) {
					$scope.show = data;
					$scope.$parent.title = $scope.show.name;

					if ('tracked' in data)
						$scope.tracked = data.tracked;
					else
						$scope.tracked = null;

					if (data.subreddit) {
						reddit_get(data.subreddit);
					}

					if (data.imdbid) {
						omdb_get(data.imdbid);
					}
				})
				.error(function(json, code) {
					if (code === 404) {
						$scope.show.name = "Show not found";
					}
				});
		};

		/**
		 * @ngdoc showCtrl.method
		 * @name showCtrl#getEpisodes
		 * @description gets episodes for show from api
		 * @methodOf krushaTV.controllers:showCtrl
		 * @param {number} show_id local show id
		 */
		var getEpisodes = function(show_id) {
			apiShow.getEpisodes(show_id)
				.success(function(data) {
					$scope.seasons = [];
					for (var season in data.seasons) {
						if (data.seasons.hasOwnProperty(season))
							$scope.seasons.push({ 'season': parseInt(season), 'episodes': data.seasons[season].episodes, 'status': false });
					}
					$scope.seasons = $filter('orderBy')($scope.seasons, 'season');

					if ($scope.seasons.length > 0) {
						$scope.seasons[$scope.seasons.length - 1].status = true;
					}
				});
		};

		/**
		 * @ngdoc showCtrl.method
		 * @name showCtrl#openAll
		 * @description opens or closes all season accordions
		 * @methodOf krushaTV.controllers:showCtrl
		 * @param {boolean} open true: open, false: close
		 */
		$scope.openAll = function(open) {
			if (open)
				$scope.oneAtATime = false;

			for (var key in $scope.seasons) {
				if ($scope.seasons.hasOwnProperty(key))
					$scope.seasons[key].status = open;
			}
		};

		/**
		 * @ngdoc showCtrl.method
		 * @name showCtrl#SaveOneAtATime
		 * @description stores user setting (if the user wants only one accordion to stay open at a time) to a cookie
		 * @methodOf krushaTV.controllers:showCtrl
		 * @param {boolean} oneAtATime true: only one accordion stays open
		 */
		$scope.SaveOneAtATime = function(oneAtATime) {
			$cookies.oneAtATime = oneAtATime;
		};

		/**
		 * @ngdoc showCtrl.method
		 * @name showCtrl#SaveShowWatched
		 * @description stores user setting (if the user wants watched episodes to be displayed) to a cookie
		 * @methodOf krushaTV.controllers:showCtrl
		 * @param {boolean} showWatched true: show watched episodes
		 */
		$scope.SaveShowWatched = function(showWatched) {
			$cookies.showWatched = showWatched;
			$scope.showWatched = showWatched;
		};

		/**
		 * @ngdoc showCtrl.method
		 * @name showCtrl#lessThanAWeek
		 * @description determines if a date is not older than a week
		 * @methodOf krushaTV.controllers:showCtrl
		 * @param {string} airdate episode air date
		 * @returns {boolean} lessThanAWeek true: this date is between now and one week ago
		 */
		$scope.lessThanAWeek = function(airdate) {
			var airdate_parsed = new Date(Date.parse(airdate));

			return (airdate_parsed >= oneWeekAgo && airdate_parsed <= today);
		};

		/**
		 * @ngdoc showCtrl.method
		 * @name showCtrl#track
		 * @description adds show to tracked shows and displays a notification
		 * @methodOf krushaTV.controllers:showCtrl
		 * @param {object} show show
		 */
		$scope.track = function(show) {
			apiShow.addTracked(show.id)
				.success(function() {
					$scope.tracked = true;
					notifications.add('Added ' + show.name + ' to tracked shows.', 'success', 5000);
				});
		};

		/**
		 * @ngdoc showCtrl.method
		 * @name showCtrl#untrack
		 * @description removes show from tracked shows and displays a notification
		 * @methodOf krushaTV.controllers:showCtrl
		 * @param {object} show show
		 */
		$scope.untrack = function(show) {
			apiShow.deleteTracked(show.id)
				.success(function() {
					$scope.tracked = false;
					notifications.add('Removed ' + show.name + ' from tracked shows.', 'danger', 5000);
				});
		};

		/**
		 * @ngdoc showCtrl.method
		 * @name showCtrl#showSeasons
		 * @description determines if a season accordion should be displayed
		 * @methodOf krushaTV.controllers:showCtrl
		 * @param {object} episodes episodes of one particular season
		 * @param {boolean} showWatched **true:** show all episodes, **false:** show only unwatched episodes
		 */
		$scope.showSeasons = function(episodes, showWatched) {
			if (showWatched === true) {
				return true;
			}
			else {
				var notWatched = 0;

				episodes.episodes.forEach(function(episode) {
					if (episode.watched !== true) {
						notWatched++;
					}
				});

				return notWatched !== 0;
			}
		};

		/**
		 * @ngdoc showCtrl.method
		 * @name showCtrl#watchedEpisode
		 * @description marks an episode as watched and sends an update to the api
		 * @methodOf krushaTV.controllers:showCtrl
		 * @param {object} episode watched episode
		 */
		$scope.watchedEpisode = function(episode) {
			apiShow.watchedEpisode(episode.id).success(function() {
				episode.watched = true;
			});
		};

		/**
		 * @ngdoc showCtrl.method
		 * @name showCtrl#notWatchedEpisode
		 * @description marks an episode as unwatched and sends an update to the api
		 * @methodOf krushaTV.controllers:showCtrl
		 * @param {object} episode unwatched episode
		 */
		$scope.notWatchedEpisode = function(episode) {
			apiShow.notWatchedEpisode(episode.id).success(function() {
				episode.watched = false;
			});
		};

		/**
		 * @ngdoc showCtrl.method
		 * @name showCtrl#submitSubreddit
		 * @description submits a subreddit url for a show
		 * @methodOf krushaTV.controllers:showCtrl
		 * @param {string} reddit_url reddit url or subreddit
		 * @param {number} show_id local show id
		 */
		$scope.submitSubreddit = function(reddit_url, show_id) {
			var subreddit = reddit_url.match(reddit_regex);

			apiReddit.submitSubreddit(subreddit[1], show_id).success(function() {
				$scope.submittedRedditText = subreddit[1];
			});
		};

		/**
		 * @ngdoc showCtrl.method
		 * @name showCtrl#submitIMDB
		 * @description submits a imdb id for a show
		 * @methodOf krushaTV.controllers:showCtrl
		 * @param {string} imdb_url imdb url or id (e.g. tt1234567)
		 * @param {number} show_id local show id
		 */
		$scope.submitIMDB = function(imdb_url, show_id) {
			var imdb_id = imdb_url.match(imdb_regex);

			apiImdb.submitIMDbId(imdb_id[1], show_id).success(function() {
				$scope.submittedImdbId = imdb_id[1];
			});
		};

		/**
		 * @ngdoc showCtrl.method
		 * @name showCtrl#updateOffset
		 * @description updates scrollfix offset
		 * @methodOf krushaTV.controllers:showCtrl
		 */
		$scope.updateOffset = function() {
			$timeout(updateOffset);
		};

		var showid = $routeParams.id;
		getShow(showid);
		getEpisodes(showid);
		updateShowWatched();
}]);