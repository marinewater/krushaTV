krusha.service('search_text', [function () {
    var search = null;

    return {
        getText: function () {
            return search
        },
        setText: function(value) {
            search = value;
        }
    };
}]);

krusha.factory('redirect', ['$location', function($location) {
    var last_location = null;
    return {
        login: function() {
            last_location = $location.path();
            $location.path('/login');
        },
        back: function() {
            if (last_location != null && last_location != 'login') {
                $location.path(last_location);
            }
            else {
                $location.path('/');
            }
        }
    }
}]);

/**
 * @ngdoc service
 * @name krushaTV.service:interceptor
 * @description checks every $http request for an 401 Unauthenticated error and redirects to the login page if the user is not authenticated
 * @requires $q
 * @requires krushaTV.service:loggedin
 * @requires krushaTV.service:redirect
 */
krusha.factory('interceptor', ['$q', 'loggedin', 'redirect', 'notifications', function($q, loggedin, redirect, notifications) {
    var rateLimitGone = null;
    var lastRateLimitNotificationShown = null;

    return {
        /**
         * @ngdoc interceptor.method
         * @methodOf krushaTV.service:interceptor
         * @name interceptor#response
         * @description does nothing
         * @param {object} response response
         * @returns {object} response
         */
        response: function(response) {
            return response;
        },

        /**
         * @ngdoc interceptor.method
         * @methodOf krushaTV.service:interceptor
         * @name interceptor#responseError
         * @description checks every $http request for an 401 Unauthenticated error and redirects to the login page if the user is not authenticated
         * @param {object} response response
         * @returns {Promise} promise
         */
        responseError: function(response) {
            // handle unauthorized users' requests to resources where a login is required
            if (response.status === 401) {
                loggedin.setStatus(false);

                if (!('login' in response.data)) {
                    redirect.login();
                }
            }

            // handle rate limiting
            if (response.status === 429) {
                if (rateLimitGone === null || rateLimitGone < Date.parse(response.data.error.nextValidRequestDate) || lastRateLimitNotificationShown + 5000 < Date.now()) {
                    rateLimitGone = Date.parse(response.data.error.nextValidRequestDate);
                    var timeTillNextRequest = Math.floor((rateLimitGone - Date.now()) / 1000); // in seconds

                    var minutes = Math.floor(timeTillNextRequest / 60);
                    var seconds = timeTillNextRequest - minutes * 60;

                    var message = 'You made to many requests. You can make next request in ';

                    message += minutes > 0 ? minutes + ' minutes and ' : '';
                    message += seconds + ' seconds.';

                    lastRateLimitNotificationShown = Date.now();

                    notifications.add(message, 'danger', 5000, true);
                }
            }

            return $q.reject(response);
        }
    };
}]);

krusha.factory('helpers', function() {
    return {
        lastOpen: function(arr) {
            var keylist = [];

            for (var key in arr) {
                if (arr.hasOwnProperty(key))
                    keylist.push(key);
            }

            var last = Math.max.apply(Math, keylist);

            arr[last].status = true;

            return arr;
        }
    }
});

krusha.factory('parse', [function() {
    var show_cache = {};
    var season_cache = {};

    var findShow = function(shows, showid) {
        if (show_cache.hasOwnProperty(showid)) {
            // show has already been stored in cache
            return show_cache[showid];
        }
        else {
            // search for show and store it in cache
            for (var i = 0, len = shows.length; i < len; i++) {
                if (shows[i].showid === showid) {
                    show_cache[showid] = i;
                    return i;
                }
            }
            return null;
        }
    };
    var findSeason = function(seasons, season_nr, show_index) {
        if (!season_cache.hasOwnProperty(show_index)) {
            season_cache[show_index] = {};
        }
        if (season_cache[show_index].hasOwnProperty(season_nr)) {
            return season_cache[show_index][season_nr];
        }
        else {
            for (var i = 0, len = seasons.length; i < len; i++) {
                if (parseInt(seasons[i].season) == parseInt(season_nr)) {
                    season_cache[show_index][season_nr] = i;
                    return i;
                }
            }
            return null;
        }
    };

    var removeUnnecessary = function(shows) {
        for (var i = shows.length-1; i >= 0; i--) {
            if (shows[i].seasons.length === 0) {
                shows.splice(i, 1);
            }
        }
    };

    return {
        unwatched: function(data, shows) {
            data.episodes.forEach(function(episode) {
                var show_index = findShow(shows, episode.showid);

                var season_index = findSeason(shows[show_index].seasons, episode.season, show_index);

                if (season_index === null) {
                    shows[show_index].seasons.push({
                        'season': episode.season,
                        'episodes': []
                    });
                    season_index = findSeason(shows[show_index].seasons, episode.season, show_index);
                }
                shows[show_index].seasons[season_index].episodes.push(episode);
            });

            removeUnnecessary(shows);

            // clean up
            show_cache = {};
            season_cache = {};
        },
        watchedEpisode: function(shows, episode, season, show) {
            var show_index = shows.indexOf(show);
            var season_index = shows[show_index].seasons.indexOf(season);
            var episode_index = shows[show_index].seasons[season_index].episodes.indexOf(episode);

            shows[show_index].seasons[season_index].episodes.splice(episode_index, 1);

            if (shows[show_index].seasons[season_index].episodes.length === 0) {
                shows[show_index].seasons.splice(season_index, 1);

                if (shows[show_index].seasons.length === 0) {
                    shows.splice(show_index, 1);
                }
            }
        },
        watchedSeason: function(shows, season, show) {
            var show_index = shows.indexOf(show);
            var season_index = shows[show_index].seasons.indexOf(season);

            shows[show_index].seasons.splice(season_index, 1);

            if (shows[show_index].seasons.length === 0) {
                shows.splice(show_index, 1);
            }
        },
        watchedShow: function(shows, show) {
            var show_index = shows.indexOf(show);

            shows.splice(show_index, 1);
        }
    }
}]);