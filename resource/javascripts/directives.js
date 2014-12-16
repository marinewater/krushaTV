/**
 * @ngdoc directive
 * @name krushaTV.directive:loadingspinner
 * @description displays a loading animation if any $http request is in process
 * @restrict E
 */
krusha.directive('loadingspinner',   ['$http' ,function ($http)
    {
        return {
            restrict: 'E',
            link: function ($scope, elm)
            {
                $scope.isLoading = function () {
                    return $http.pendingRequests.length > 0;
                };

                $scope.$watch($scope.isLoading, function (v)
                {
                    if (v) {
                        elm.show();
                    } else {
                        elm.hide();
                    }
                });
            },
            template: '<div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>'
        };
    }
]);

/**
 * @ngdoc directive
 * @name krushaTV.directive:loadingcontent
 * @description hides the element it is attributed to if any $http request is in process
 * @restrict A
 */
krusha.directive('loadingcontent',   ['$http' ,function ($http)
    {
        return {
            restrict: 'A',
            link: function (scope, elm)
            {
                scope.isLoading = function () {
                    return $http.pendingRequests.length > 0;
                };

                scope.$watch(scope.isLoading, function (v)
                {
                    if(v){
                        elm.hide();
                    } else {
                        elm.show();
                    }
                });
            }
        };
    }
]);


/**
 * @ngdoc directive
 * @name krushaTV.directive:unwatched
 * @description displays all watched/unwatched episodes and lets the user mark them as unwatched/watched
 * @restrict E
 * @scope
 * @param {object} shows object containing shows with watched/unwatched episodes
 * @param {object} seasons object containing seasons with watched/unwatched episodes
 * @param {object} episodes object containing watched/unwatched episodes
 */
krusha.directive('unwatched', ['$timeout', 'loggedin', function($timeout, loggedin) {
    var link = function($scope) {
        if (typeof $scope.shows === 'undefined')
            $scope.shows = [];
        if (typeof $scope.seasons === 'undefined')
            $scope.seasons = [];

        $scope.dateFormat = loggedin.getDateFormat();

        $scope.getActiveShow = function() {
            return $scope.shows.find(function(show) {
                return !!show.active;
            });
        };

        $scope.scrollShows = function() {
            $(document.body).animate({
                'scrollTop':   $('#shows').offset().top - 70
            }, 200);
        };

        $scope.getActiveSeason = function() {
            return $scope.seasons.find(function(season) {
                return !!season.active;
            });
        };

        $scope.getSeasonsScroll = function(show_id) {
            $scope.getSeasons(show_id);
            $(document.body).animate({
                'scrollTop':   $('#seasons').offset().top - 70
            }, 200);
        };

        $scope.getEpisodesScroll = function(show_id, season) {
            $scope.getEpisodes(show_id, season);
            $(document.body).animate({
                'scrollTop':   $('#episodes').offset().top - 70
            }, 200);
        };

        $scope.watched_text = $scope.watched ? 'unwatched' : 'watched';
        $scope.watched_text_cap = $scope.watched ? 'Unwatched' : 'Watched';
        $scope.watched_text_cap_short = $scope.watched ? 'Unw.' : 'W.';
    };

    return {
        restrict: 'E',
        templateUrl: '/static/templates/directives/unwatched.html',
        link: link,
        scope: {
            shows: '=shows',
            seasons: '=seasons',
            episodes: '=episodes',
            getSeasons: '=getSeasons',
            getEpisodes: '=getEpisodes',
            markEpisodeWatched: '=markEpisodeWatched',
            markSeasonWatched: '=markSeasonWatched',
            markShowWatched: '=markShowWatched',
            watched: '=watched'
        }
    }
}]);

/**
 * @ngdoc directive
 * @name krushaTV.directive:success
 * @description displays an symbol for a specified amount of time to indicate if a action has failed or succeeded
 * @restrict E
 * @scope
 * @param {number} timeout timeout in milliseconds
 * @param {boolean} success true for success, false for error
 */
krusha.directive('success', ['$timeout', function($timeout) {
    var link = function($scope, element) {
        var timeout_promise = null;
        $scope.$watch('successHandler', function(newVal, oldVal) {
            if (newVal !== oldVal && newVal !== 'not') {
                $timeout.cancel(timeout_promise);
                element.fadeIn(100);
                $scope.success = $scope.successHandler;
                $scope.successHandler = 'not';

                timeout_promise = $timeout(function() {
                    element.fadeOut();
                }, $scope.timeout);
            }
        }, true);
    };

    return {
        restrict: 'E',
        scope: {
            timeout: '@timeout',
            successHandler: '=success'
        },
        template: '<span class="text-success glyphicon glyphicon-ok" ng-if="success === true"></span><span class="text-danger" ng-if="success === false">Error</span>',
        link: link
    };
}]);

krusha.directive('genreLabels', [function() {
    var link = function($scope, element, attrs) {
        var unwatch = $scope.$watch(attrs.genres, function(value) {
            if (typeof value !== 'undefined') {
                $scope.genres = value.split(', ');
                unwatch();
            }
        });
    };

    return {
        restrict: 'E',
        link: link,
        template: '<span class="label label-default" ng-repeat="genre in ::genres">{{ ::genre }}</span>'
    };
}]);

krusha.directive('slider', function($timeout) {
    var body = $("body");

    var link = function($scope, element) {

        var bar = element.find(".bar");
        var barWidth = null;
        var barPositionLeft = null;
        var barPositionRight = null;
        var handleWidth = null;

        function addListeners(element) {
            element.find(".handle").bind("mousedown touchstart", startSlide);
        }

        function init() {
            // jquery can determine the width of an element only if it is visible
            if (bar.is(":visible")) {
                barWidth = bar.width();
                barPositionLeft = bar.offset().left;
                barPositionRight = barPositionLeft + barWidth;
                handleWidth = element.find('.handle').width();

                $scope.$watch('model', function(model) {
                    var perc = (barWidth - handleWidth) / barWidth;
                    var step = (model - $scope.min) / ($scope.max - $scope.min) * 100 * perc;

                    element.find(".handle").css("left", step + "%");
                });
            }
            else {
                $timeout(init, 100);
            }
        }

        function startSlide(event) {
            event.preventDefault();

            if (typeof $scope.onSlideStart !== "undefined") {
                $scope.onSlideStart();
            }

            body.bind("mouseup touchend", stopSlide);
            body.bind("mousemove", slideMouse);
            body.bind("touchmove", slideTouch);
        }

        function stopSlide(event) {
            event.preventDefault();
            body.unbind("mouseup touchend", stopSlide);
            body.unbind("mousemove", slideMouse);
            body.unbind("touchmove", slideTouch);

            if (typeof $scope.onSlideStop !== "undefined") {
                $scope.onSlideStop();
            }
        }

        function slideMouse(event) {
            event.preventDefault();
            slide(event.pageX);
        }

        function slideTouch(event) {
            event.preventDefault();
            slide(event.originalEvent.touches[0].pageX);
        }

        function slide(pageX) {

            var diff = null;

            if (barPositionLeft > pageX) {
                diff = 0;
            }
            else if (barPositionRight < pageX) {
                diff = barWidth;
            }
            else {
                diff = pageX - barPositionLeft;
            }

            $scope.$apply(function() {
                var temp_model = (parseInt($scope.min) + diff/barWidth * (parseInt($scope.max) - parseInt($scope.min)));
                $scope.model = temp_model - temp_model % $scope.step;
            });
        }

        init();

        addListeners(element);
    };

    return {
        restrict: 'E',
        link: link,
        scope: {
            min: '@',
            max: '@',
            step: '@',
            model: '=ngModel',
            onSlideStart: '&',
            onSlideStop: '&'
        },
        template: '<div class="bar"><div class="handle"></div></div>'
    }
});