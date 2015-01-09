krusha.directive('calendar', ['calendar', function(calendar) {
    var link = function($scope) {
        var today = new Date();

        $scope.year = today.getFullYear();
        $scope.month = today.getMonth()+1;

        $scope.allMonth = calendar.getAllMonth();
        $scope.allWeekdays = calendar.allWeekdays;

        var addShows = function(days, shows) {
            for (var show in shows) {
                if (shows.hasOwnProperty(show)) {
                    for (var day in days) {
                        if (days.hasOwnProperty(day)) {
                            var date = days[day].date;
                            var airdate = new Date(shows[show].airdate);
                            if (date.getFullYear() === airdate.getFullYear() && date.getMonth() === airdate.getMonth() && date.getDate() === airdate.getDate()) {
                                days[day].shows.push(shows[show]);
                                break;
                            }
                        }
                    }
                }
            }
        };

        $scope.changeMonth = function(year, month) {
            if (typeof year === 'undefined' || typeof month === 'undefined') {
                var today = new Date();
                year = today.getFullYear();
                month = today.getMonth()+1;
            }
            var days = calendar.getDays(year, month);

            $scope.getShows()(year, month).success(function(data) {
                addShows(days, data.episodes);
                $scope.days = days;
            });
        };

        $scope.monthBack = function() {
            $scope.month = $scope.month === 1 ? 12 : $scope.month - 1;
            if ($scope.month === 12) {
                $scope.year--;
            }

            $scope.changeMonth($scope.year, $scope.month);
        };

        $scope.monthForward = function() {
            $scope.month = $scope.month === 12 ? 1 : $scope.month + 1;
            if ($scope.month === 1) {
                $scope.year++;
            }

            $scope.changeMonth($scope.year, $scope.month);
        };

        $scope.changeMonth();
    };

    return {
        restrict: 'E',
        link: link,
        templateUrl: '/static/templates/directives/calendar.html',
        scope: {
            getShows: '&'
        }
    }
}]);

krusha.directive('dates', ['$filter', function($filter) {
    /**
     * create a table cell for each day of the week and fill it with the corresponding episodes
     * @param row
     * @param day
     */
    var addDay = function(row, day) {
        var date_cell = $('<td/>');
        $('<div/>').addClass('date').text(day.date.getDate()).appendTo(date_cell);

        var list = $('<ul/>').addClass('list-unstyled').appendTo(date_cell);

        var shows = $filter('orderByName')(day.shows);

        shows.forEach(function(show) {
            var show_item = $('<li/>').appendTo(list);
            $('<a/>').attr('href', '/show/' + show.id).text(show.name).appendTo(show_item);
            $('<span/>').text(' - ' + $filter('formatEpisode')(show.episode, show.season)).appendTo(show_item);
        });

        if (!day.active) {
            date_cell.addClass('inactive');
        }
        row.append(date_cell);
    };

    var link = function($scope, element) {
        $scope.$watch('days', function() {
            element.empty();

            if (typeof $scope.days !== 'undefined') {
                // add row for every week
                for (var i = 0; i < $scope.days.length; i += 7) {
                    var row = $('<tr/>');
                    for (var j = i; j < i + 7; j++) {
                        addDay(row, $scope.days[j]);
                    }
                    element.append(row);
                }
            }
        });
    };

    return {
        restrict: 'A',
        link: link,
        scope: {
            days: '='
        }
    }
}]);