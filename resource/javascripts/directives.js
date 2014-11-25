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
 * @name krushaTV.directive:watched
 * @description displays all watched/unwatched episodes and lets the user mark them as unwatched/watched
 * @restrict E
 * @scope
 * @param {object} shows object containing watchted/unwatched episodes
 * @param {function} markEpisodeWatched function that marks an episode as watched/unwatched
 * @param {function} markSeasonWatched function that marks a season and all of its episodes as watched/unwatched
 * @param {function} markShowWatched function that marks a show and all of its seasons and episodes as watched/unwatched
 * @param {boolean} watched displays the correct words (watched/unwatched): **true:** shows unwatched episodes, **false:** shows watched episodes
 */
krusha.directive('watched', ['$cookies', function($cookies) {
    var link = function ($scope) {
        if ($cookies.oneAtATime === undefined) {
            $cookies.oneAtATime = true;
        }
        $scope.oneAtATime = $cookies.oneAtATime === 'true';

        if ($scope.watched) {
            $scope.watchedText = "unwatched";
            $scope.notWatchedText = "watched";
        }
        else {
            $scope.watchedText = "watched";
            $scope.notWatchedText = "unwatched";
        }

        $scope.openAll = function(open) {
            if (open)
                $scope.oneAtATime = false;

            for (var key in $scope.shows) {
                if ($scope.shows.hasOwnProperty(key))
                    $scope.shows[key].status = open;
            }
        };

        $scope.SaveOneAtATime = function(oneAtATime) {
            $cookies.oneAtATime = oneAtATime;
        };
    };

    return {
        restrict: 'E',
        scope: {
            shows: '=shows',
            markEpisodeWatched: '=episodeWatched',
            markSeasonWatched: '=seasonWatched',
            markShowWatched: '=showWatched',
            watched: '=watched'
        },
        link: link,
        templateUrl: '/static/templates/directives/watched.html'
    };
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
    }
}]);