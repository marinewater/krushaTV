/**
 * @ngdoc service
 * @name krushaTV.service:calendar
 * @description helper functions for calendar directive
 */
krusha.factory('calendar', [function() {
    /**
     * @ngdoc calendar.method
     * @methodOf krushaTV.service:calendar
     * @name calendar#lastDayOfMonth
     * @description returns the last day of the specified month (e.g. 31 for december, 30 for november)
     * @param {Number} year year
     * @param {Number} month month
     * @return {Number} last day of the month
     */
    var lastDayOfMonth = function(year, month) {
        var d = new Date(year, month, 0);
        return d.getDate();
    };

    /**
     * @ngdoc calendar.method
     * @methodOf krushaTV.service:calendar
     * @name calendar#getDays
     * @description creates an array with entries for every day of the month and the previous and following days (complete weeks, so first day in array is an monday and the last a sunday)
     * @param {Number} year year
     * @param {Number} month month
     * @return {Array} contains an entry for every day of the month
     */
    var getDays = function(year, month) {
        var today = new Date();

        if (typeof year === 'undefined' || typeof month === 'undefined') {
            year = today.getFullYear();
            month = today.getMonth()+1;
        }

        var lastDay = lastDayOfMonth(year, month);
        var firstDay = new Date(year, month-1, 1);

        var days = [];

        if (firstDay.getDay() !== 1) {
            for (var i=0; i>-7; i--) {
                var day_date = new Date(year, month-1, i);
                days.push({
                    'date': day_date,
                    'active': false,
                    'shows': []
                });

                if (day_date.getDay() === 1) {
                    break;
                }
            }

            days = days.reverse();
        }

        var j = 1;
        while (true) {
            var day = new Date(year, month-1, j);
            var active = true;

            if (j > lastDay) {
                active = false;
            }

            days.push({
                'date': day,
                'active': active,
                'shows': []
            });

            if (j >= lastDay && day.getDay() === 0) {
                break;
            }
            j++;
        }

        return days;
    };

    /**
     * @ngdoc calendar.method
     * @methodOf krushaTV.service:calendar
     * @name calendar#getDaysWeek
     * @description creates an array with entries for every day of the month and the previous and following days (complete weeks, so first day in array is an monday and the last a sunday)
     * @param {Date} first_day first day of the week
     * @param {Date} last_day last day of the week
     * @return {Array} contains an entry for every day of the week
     */
    var getDaysWeek = function(first_day, last_day) {
        var days = [];

        for (var day = new Date(first_day); day <= last_day; day.setDate(day.getDate() + 1)) {
            days.push({
                'date': new Date(day), // without new Date every day ends up being the last day
                'active': true,
                'shows': []
            });
        }

        return days;
    };

    /**
     * @ngdoc calendar.method
     * @methodOf krushaTV.service:calendar
     * @name calendar#getDaysDay
     * @description creates an array with an entry for one day
     * @param {Date} day day
     * @return {Array} contains an entry for one day
     */
    var getDaysDay = function(day) {
        var days = [];

        days.push({
            'date': new Date(day), // without new Date every day ends up being the last day
            'active': true,
            'shows': []
        });

        return days;
    };

    /**
     * @ngdoc calendar.method
     * @methodOf krushaTV.service:calendar
     * @name calendar#getAllMonth
     * @description returns array containing numbers one to twelve
     * @return {Array} month
     */
    var getAllMonth = function() {
        var month = [];

        for (var i=1; i<=12; i++) {
            month.push(i);
        }

        return month;
    };

    /**
     * @ngdoc calendar.method
     * @methodOf krushaTV.service:calendar
     * @name calendar#getWeekDay
     * @description returns the the name for a day of the week
     * @param {Number} day javascript's day of the week
     * @return {String} name of the weekday
     */
    var getWeekDay = function(day) {
        day -= 1;

        if (day < 0) {
            day = 6;
        }

        return allWeekdays[day];
    };

    /**
     * weekdays
     * @type {string[]}
     */
    var allWeekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return {
        getAllMonth: getAllMonth,
        allWeekdays: allWeekdays,
        getDays: getDays,
        getDaysWeek: getDaysWeek,
        getWeekDay: getWeekDay,
        getDaysDay: getDaysDay
    }
}]);