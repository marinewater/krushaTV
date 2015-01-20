/**
 * @ngdoc directive
 * @name krushaTV.directive:calendar
 * @description calendar widget
 * @restrict E
 * @scope
 * @param {function} getShowsMonth request shows for month
 * @param {function} getShowsWeek request shows for week
 * @param {function} getShowsDay request shows for day
 */
krusha.directive('calendar', ['calendar', 'hotkeys', 'loggedin', function(calendar, hotkeys, loggedin) {
    var link = function($scope) {
        var today = new Date();

        $scope.date_format = loggedin.getDateFormat();

        $scope.$on('loggedin', function() {
            $scope.date_format = loggedin.getDateFormat();
        });

        $scope.active_mode = 'week';

        $scope.year = today.getFullYear();
        $scope.month = today.getMonth()+1;

        $scope.allMonth = calendar.getAllMonth();
        $scope.allYears = calendar.getAllYears();
        $scope.allWeekdays = null;

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

        /**
         * select a month to display
         * @param year
         * @param month
         */
        $scope.changeMonth = function(year, month) {
            $scope.allWeekdays = calendar.allWeekdays;

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

        /**
         * go to previous month
         */
        $scope.monthBack = function() {
            $scope.month = $scope.month === 1 ? 12 : $scope.month - 1;
            if ($scope.month === 12) {
                $scope.year--;
            }

            $scope.changeMonth($scope.year, $scope.month);
        };

        /**
         * go to next month
         */
        $scope.monthForward = function() {
            $scope.month = $scope.month === 12 ? 1 : $scope.month + 1;
            if ($scope.month === 1) {
                $scope.year++;
            }

            $scope.changeMonth($scope.year, $scope.month);
        };

        /**
         * select a week to display
         * @param year
         * @param month
         * @param day
         */
        $scope.changeWeek = function(year, month, day) {
            $scope.allWeekdays = calendar.allWeekdays;

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

        /**
         * select a day to display
         * @param year
         * @param month
         * @param day
         */
        $scope.changeDayDisplay = function(year, month, day) {
            if (typeof year === 'undefined' || typeof month === 'undefined' || typeof day === 'undefined') {
                var today = new Date();
                year = today.getFullYear();
                month = today.getMonth()+1;
                day = today.getDate();
            }

            var weekday = new Date(year, month-1, day);
            $scope.allWeekdays = [calendar.getWeekDay(weekday.getDay())];

            $scope.getShowsDay()(year, month, day).success(function(data) {
                $scope.thisDay = new Date(data.span.date);

                var days = calendar.getDaysDay($scope.thisDay);
                addShows(days, data.episodes);
                $scope.days = days;
            });
        };

        /**
         * change to day mode in calendar
         * @param year
         * @param month
         * @param day
         */
        $scope.changeToDay = function(year, month, day) {
            $scope.active_mode = 'day';
            bindHotkeys();
            $scope.dt = new Date(year, month-1, day);
            $scope.changeDayDisplay(year, month, day);
        };

        /**
         * move days forward or backwards
         * @param days
         */
        $scope.changeDay = function(days) {
            $scope.dt = new Date($scope.dt.setDate($scope.dt.getDate() + days));

            if ($scope.active_mode === 'week') {
                $scope.changeWeek($scope.dt.getFullYear(), $scope.dt.getMonth()+1, $scope.dt.getDate());
            }
            else {
                $scope.changeDayDisplay($scope.dt.getFullYear(), $scope.dt.getMonth()+1, $scope.dt.getDate());
            }
        };

        /**
         * select a specific date
         * @param date
         */
        $scope.changeDate = function(date) {
            var year = date.getFullYear();
            var month = date.getMonth()+1;
            var day = date.getDate();

            if ($scope.active_mode === 'week') {
                $scope.changeWeek(year, month, day);
            }
            else {
                $scope.changeDayDisplay(year, month, day);
            }
        };

        /**
         * change calendar mode to month, week or day
         * @param mode
         */
        $scope.changeMode = function(mode) {
            var now = new Date();
            var mode_before = $scope.active_mode;
            $scope.active_mode = mode;
            bindHotkeys();

            if (mode !== 'month') {
                if (mode_before === 'month') {
                    if ((typeof $scope.year === 'undefined' || typeof $scope.month === 'undefined') || ($scope.year === now.getFullYear() && $scope.month === now.getMonth()+1)) {
                        $scope.dt = now;
                    }
                    else {
                        $scope.dt = new Date($scope.year, $scope.month-1, 1);
                    }
                }

                if (mode === 'week') {
                    $scope.changeWeek($scope.dt.getFullYear(), $scope.dt.getMonth()+1, $scope.dt.getDate());
                }
                else if (mode === 'day') {
                    $scope.changeDayDisplay($scope.dt.getFullYear(), $scope.dt.getMonth()+1, $scope.dt.getDate());
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

        /**
         * rebind hotkeys if calendar mode is changed
         */
        var bindHotkeys = function() {
            hotkeys.del('right');
            hotkeys.del('left');

            switch($scope.active_mode) {
                case 'month':
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
                    break;
                case 'day':
                    hotkeys.bindTo($scope)
                        .add({
                            combo: 'right',
                            description: 'go to next day',
                            callback: function() {
                                $scope.changeDay(1);
                            }
                        })
                        .add({
                            combo: 'left',
                            description: 'go to previous day',
                            callback: function() {
                                $scope.changeDay(-1);
                            }
                        });
                    break;
                case 'week':
                    hotkeys.bindTo($scope)
                        .add({
                            combo: 'right',
                            description: 'go to next week',
                            callback: function() {
                                $scope.changeDay(7);
                            }
                        })
                        .add({
                            combo: 'left',
                            description: 'go to previous week',
                            callback: function() {
                                $scope.changeDay(-7);
                            }
                        });
            }
        };

        bindHotkeys();
        $scope.changeWeek($scope.dt.getFullYear(), $scope.dt.getMonth()+1, $scope.dt.getDate());
    };

    return {
        restrict: 'E',
        link: link,
        templateUrl: '/static/templates/directives/calendar.html',
        scope: {
            getShowsMonth: '&',
            getShowsWeek: '&',
            getShowsDay: '&'
        }
    }
}]);

/**
 * @ngdoc directive
 * @name krushaTV.directive:dates
 * @description helper directive for calendar directive
 * @restrict A
 * @scope
 * @param {Array} days array containing days and shows for each day
 * @param {function} changeToDay function is called if the user clicks on a day
 */
krusha.directive('dates', ['$filter', 'calendar', function($filter, calendar) {
    /**
     * create a table cell for each day of the week and fill it with the corresponding episodes
     * @param row
     * @param day
     * @param changeToDay
     */
    var addDay = function(row, day, changeToDay) {
        if (typeof day !== 'undefined') {
            var date_cell = $('<td/>');
            var date = $('<div/>');

            date.addClass('date')
                .text(day.date.getDate())
                .on('click', function() {
                    changeToDay()(day.date.getFullYear(), day.date.getMonth()+1, day.date.getDate());
                })
                .appendTo(date_cell);

            $('<span/>')
                .text(calendar.getWeekDay(day.date.getDay()))
                .appendTo(date);

            var list = $('<ul/>')
                .addClass('list-unstyled')
                .appendTo(date_cell);

            var shows = $filter('orderByName')(day.shows);

            shows.forEach(function(show) {
                var show_item = $('<li/>').appendTo(list);
                $('<a/>')
                    .attr('href', '/show/' + show.id)
                    .text(show.name)
                    .appendTo(show_item);
                $('<span/>')
                    .text(' - ' + $filter('formatEpisode')(show.episode, show.season))
                    .appendTo(show_item);
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
                        addDay(row, $scope.days[j], $scope.changeToDay);
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
            days: '=',
            changeToDay: '&'
        }
    }
}]);