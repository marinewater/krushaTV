krusha.directive('calendar', ['calendar', 'hotkeys', 'loggedin', function(calendar, hotkeys, loggedin) {
    var link = function($scope) {
        var today = new Date();

        $scope.date_format = loggedin.getDateFormat();

        $scope.active_mode = 'week';

        $scope.year = today.getFullYear();
        $scope.month = today.getMonth()+1;

        $scope.allMonth = calendar.getAllMonth();
        $scope.allWeekdays = calendar.allWeekdays;

        $scope.dt = new Date();

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

        /**
         * shows DatePicker
         * @param $event
         */
        $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };

        $scope.changeWeek = function(year, month, day) {
            if (typeof year === 'undefined' || typeof month === 'undefined' || typeof day === 'undefined') {
                var today = new Date();
                year = today.getFullYear();
                month = today.getMonth()+1;
                day = today.getDate();
            }

            $scope.getShowsWeek()(year, month, day).success(function(data) {

                $scope.first_day = new Date(data.span.frame.from);
                $scope.last_day = new Date(data.span.frame.to);

                var days = calendar.getDaysWeek($scope.first_day, $scope.last_day);
                addShows(days, data.episodes);
                $scope.days = days;
            });
        };

        $scope.changeMonth = function(year, month) {
            if (typeof year === 'undefined' || typeof month === 'undefined') {
                var today = new Date();
                year = today.getFullYear();
                month = today.getMonth()+1;
            }
            var days = calendar.getDays(year, month);

            $scope.getShowsMonth()(year, month).success(function(data) {
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

        $scope.changeDay = function(days) {
            $scope.dt = new Date($scope.dt.setDate($scope.dt.getDate() + days));

            if ($scope.active_mode === 'week') {
                $scope.changeWeek($scope.dt.getFullYear(), $scope.dt.getMonth()+1, $scope.dt.getDate());
            }
        };

        $scope.changeMode = function(mode) {
            var now = new Date();
            $scope.active_mode = mode;

            if (mode !== 'month') {

                if ((typeof $scope.year === 'undefined' || typeof $scope.month === 'undefined') || ($scope.year === now.getFullYear() && $scope.month === now.getMonth()+1)) {
                    $scope.dt = now;
                }
                else {
                    $scope.dt = new Date($scope.year, $scope.month-1, 1);
                }

                if (mode === 'week') {
                    $scope.changeWeek($scope.dt.getFullYear(), $scope.dt.getMonth()+1, $scope.dt.getDate());
                }
            }

            else {
                if (typeof $scope.dt === 'undefined') {
                    $scope.year = now.getFullYear();
                    $scope.month = now.getMonth()+1;
                }
                else {
                    $scope.year = $scope.dt.getFullYear();
                    $scope.month = $scope.dt.getMonth()+1;
                }

                $scope.changeMonth($scope.year, $scope.month);
            }
        };

        // bind hotkeys
        hotkeys.bindTo($scope)
            .add({
                combo: 'right',
                description: 'go to next month',
                callback: function() {
                    $scope.monthForward();
                }
            })
            .add({
                combo: 'left',
                description: 'go to previous month',
                callback: function() {
                    $scope.monthBack();
                }
            });

        $scope.changeWeek($scope.dt.getFullYear(), $scope.dt.getMonth()+1, $scope.dt.getDate());
    };

    return {
        restrict: 'E',
        link: link,
        templateUrl: '/static/templates/directives/calendar.html',
        scope: {
            getShowsMonth: '&',
            getShowsWeek: '&'
        }
    }
}]);

krusha.directive('dates', ['$filter', 'calendar', function($filter, calendar) {
    var getWeekDay = function(day) {
        day -= 1;

        if (day < 0) {
            day = 6;
        }

        return calendar.allWeekdays[day];
    };

    /**
     * create a table cell for each day of the week and fill it with the corresponding episodes
     * @param row
     * @param day
     */
    var addDay = function(row, day) {
        if (typeof day !== 'undefined') {
            var date_cell = $('<td/>');
            var date = $('<div/>');

            date.addClass('date').text(day.date.getDate()).appendTo(date_cell);

            $('<span/>').text(getWeekDay(day.date.getDay())).appendTo(date);

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
        }
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