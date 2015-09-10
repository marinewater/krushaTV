/**
 * @ngdoc controller
 * @name krushaTV.controllers:showCtrl
 * @description
 * Controller for show.html template
 * @requires $scope
 * @requires $routeParams
 * @requires $cookies
 * @requires $cookieStore
 * @requires $timeout
 * @requires krushaTV.service:apiShowFactory
 * @requires krushaTV.service:apiRedditFactory
 * @requires krushaTV.service:apiImdbFactory
 * @requires krushaTV.service:notificationsFactory
 * @requires krushaTV.service:loggedinFactory
 */
krusha.controller('showCtrl', ['$scope', '$location', '$routeParams', '$cookies', '$cookieStore', '$timeout', 'apiShowFactory', 'apiRedditFactory', 'apiImdbFactory', 'notificationsFactory', 'loggedinFactory',
	function($scope, $location, $routeParams, $cookies, $cookieStore, $timeout, apiShowFactory, apiRedditFactory, apiImdbFactory, notificationsFactory, loggedinFactory) {
		var apiShow = new apiShowFactory();
		var apiImdb = new apiImdbFactory();
		var apiReddit = new apiRedditFactory();
		var notifications = new notificationsFactory();
		var loggedin = new loggedinFactory();

		$scope.show = {};
		$scope.seasons = {};
		$scope.tracked = null;
		$scope.reddit = [];
		$scope.showWatched = true;
		$scope.loggedin = loggedin.getStatus();
		$scope.submittedRedditText = false;
		$scope.submittedImdbId = false;

		$scope.dateFormat = loggedin.getDateFormat();
		$scope.$on('loggedin', function() {
			$scope.dateFormat = loggedin.getDateFormat();
		});

		var reddit_info = {};

		$scope.dateFormat = loggedin.getDateFormat();

		var oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
		var today = new Date();

		$scope.display = typeof $cookieStore.get('display') !== 'undefined' ? $cookieStore.get('display') : { reddit: true,imdb: true };

		$scope.$on('loggedin', function() {
			$scope.loggedin = loggedin.getStatus();
			getShow(showid);
			$scope.getEpisodes(showid, $scope.active_season + 1);
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
			}).error(function() {
				$scope.omdb = false;
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
			}).error(function() {
				$scope.reddit = false;
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
					$scope.$parent.title = $scope.show.name + ' Season ' + ($scope.active_season + 1).toString();

					if ('tracked' in data)
						$scope.tracked = data.tracked;
					else
						$scope.tracked = null;

					if (data.subreddit && $scope.display.reddit) {
						reddit_get(data.subreddit);
					}

					if (data.imdbid && $scope.display.imdb) {
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
		 * @name showCtrl#getSeasons
		 * @description gets seasons for show and episodes for first season from api
		 * @methodOf krushaTV.controllers:showCtrl
		 * @param {number} show_id local show id
		 * @param {number=} active_season active season
		 */
		var getSeasons = function(show_id, active_season) {
			apiShow.getSeasons(show_id, active_season).success(function(data) {
				$scope.$parent.title = $scope.show.name + ' Season ' + ($scope.active_season + 1).toString();
				$scope.seasons = data.seasons;

				if (typeof active_season === 'undefined') {
					active_season = data.season - 1;
				}
				else {
					active_season--;
				}

				$scope.seasons[active_season].active = true;
				$location.search('season', active_season + 1);
				$scope.episodes = data.episodes;
				updateScrollOffset();
			});
		};

		/**
		 * @ngdoc showCtrl.method
		 * @name showCtrl#getEpisodes
		 * @description gets episodes for show from api
		 * @methodOf krushaTV.controllers:showCtrl
		 * @param {number} show_id local show id
		 * @param {number} season_nr season number
		 */
		$scope.getEpisodes = function(show_id, season_nr) {
			apiShow.getEpisodes(show_id, season_nr)
				.success(function(data) {
					$scope.active_season = season_nr - 1;
					$scope.$parent.title = $scope.show.name + ' Season ' + ($scope.active_season + 1).toString();
					$location.search('season', season_nr);
					$scope.episodes = data.episodes;

					$scope.seasons.find(function(season) {
						return season.active === true;
					}).active = false;
					$scope.seasons.find(function(season) {
						return season.season === data.season;
					}).active = true;
					updateScrollOffset();
					scrollToEpisodes();
				});
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

			getNextUnwatchedSeason();
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
		 * @param {boolean} tracked true: show is tracked
		 */
		$scope.track = function(show, tracked) {
			if (!tracked) {
				apiShow.addTracked(show.id)
					.success(function() {
						$scope.tracked = true;
						notifications.add('Added ' + show.name + ' to tracked shows.', 'success', 5000);
						getSeasons(show.id, $scope.active_season);
					});
			}
			else {
				apiShow.deleteTracked(show.id)
					.success(function() {
						$scope.tracked = false;
						notifications.add('Removed ' + show.name + ' from tracked shows.', 'danger', 5000);
					});
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
			var season = $scope.seasons.find(function(season) {
				return season.active === true;
			});
			if (!episode.watched) {
				apiShow.watchedEpisode(episode.id).success(function() {
					episode.watched = true;
					if (Date.parse(episode.airdate) <= Date.now()) {
						season.watched_count++;
					}
					getNextUnwatchedSeason();
				});
			}
			else {
				apiShow.notWatchedEpisode(episode.id).success(function() {
					episode.watched = false;
					if (Date.parse(episode.airdate) <= Date.now()) {
						season.watched_count--;
					}
					getNextUnwatchedSeason();
				});
			}
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
		 * @name showCtrl#updateScrollOffset
		 * @description updates scrollfix offset
		 * @methodOf krushaTV.controllers:showCtrl
		 */
		var updateScrollOffset = function() {
			$timeout(updateOffset);
		};

		/**
		 * @ngdoc showCtrl.method
		 * @name showCtrl#unwatchedSeasons
		 * @description checks if there are seasons wih unwatched episodes
		 * @methodOf krushaTV.controllers:showCtrl
		 * @returns {boolean} unwatchedSeasons true: there are seasons with unwatched episodes
		 */
		$scope.unwatchedSeasons = function() {
			if ($scope.tracked && $scope.showWatched === false) {
				for (var season in $scope.seasons) {
					if ($scope.seasons.hasOwnProperty(season)) {
						if ($scope.seasons[season].episode_count > $scope.seasons[season].watched_count) {
							return true;
						}
					}
				}
				return false;
			}
			return true;
		};

		/**
		 * @ngdoc showCtrl.method
		 * @name showCtrl#getNextUnwatchedSeason
		 * @description checks if the active season has any unwatched seasons and loads up the next or previous season if it doesn't
		 * @methodOf krushaTV.controllers:showCtrl
		 */
		var getNextUnwatchedSeason = function() {
			if ($scope.showWatched !== true) {
				var nextUnwatchedSeason = false;

				for (var i = $scope.active_season-1; i < $scope.seasons.length; i++) {
					if ($scope.seasons.hasOwnProperty(i)) {
						if ($scope.seasons[i].episode_count > $scope.seasons[i].watched_count) {
							nextUnwatchedSeason = i;
							break;
						}
					}
				}

				if (!nextUnwatchedSeason) {
					for (var j = $scope.active_season-2; j >= 0; j--) {
						if ($scope.seasons.hasOwnProperty(j)) {
							if ($scope.seasons[j].episode_count > $scope.seasons[j].watched_count) {
								nextUnwatchedSeason = j;
								break;
							}
						}
					}
				}

				if (nextUnwatchedSeason > 0 || nextUnwatchedSeason === 0) {
					$scope.getEpisodes($scope.show.id, nextUnwatchedSeason+1);
				}
			}
		};

		/**
		 * @ngdoc showCtrl.method
		 * @name showCtrl#scrollToEpisodes
		 * @description scrolls to episodes
		 * @methodOf krushaTV.controllers:showCtrl
		 */
		var scrollToEpisodes = function() {
			$('html,body').animate({
				'scrollTop':   $('#episodes').offset().top - 70
			}, 200);
		};

		var showid = $routeParams.id;

		if (!('season' in $location.search())) {
			$location.search('season', '1');
			$scope.active_season = 0;
		}
		else {
			$scope.active_season = parseInt($location.search()['season']) - 1;
		}

		getShow(showid);
		getSeasons(showid, $scope.active_season + 1);
		updateShowWatched();
}]);