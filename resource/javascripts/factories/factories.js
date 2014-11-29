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
krusha.factory('interceptor', ['$q', 'loggedin', 'redirect', function($q, loggedin, redirect) {
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
            if (response.status === 401) {
                loggedin.setStatus(false);

                if (!('login' in response.data)) {
                    redirect.login();
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

krusha.factory('notifications', ['$rootScope', function($rootScope) {
    var notifications = [];

    return {
        // message: message that will be displaywed in the notification
        // bg_class: can be success, warning, danger or info, determines the background color
        // ttl: time in miliseconds the notification will be displayed
        add: function(message, bg_class, ttl) {
            notifications.push({
                'message': message,
                'class': bg_class,
                'ttl': ttl
            });

            $rootScope.$broadcast('notification', true);
        },
        pop: function() {
            var note_temp = notifications;
            notifications = [];
            return note_temp;
        }
    }
}]);

krusha.factory('loggedin', ['$rootScope', function($rootScope) {
    var loggedin = false;
    var user = null;
    var dateFormat = 'yyyy-MM-dd';

    return {
        getStatus: function() {
            return loggedin;
        },
        setStatus: function(status) {
            loggedin = status;
            $rootScope.$broadcast('loggedin');
        },
        setUser: function(username) {
            user = username;
        },
        getUser: function() {
            return user;
        },
        getDateFormat: function() {
            return dateFormat;
        },
        setDateFormat: function(format) {
            if (format)
                dateFormat = format;
            else
                dateFormat = 'yyyy-MM-dd';
        }
    }
}]);

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