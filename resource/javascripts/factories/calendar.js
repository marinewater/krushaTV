/**
 * @ngdoc service
 * @name krushaTV.service:calendarFactory
 * @description helper functions for calendarFactory directive
 */
krusha.factory('calendarFactory', function() {
    var calendar = function() {
        this.allWeekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    };
    
    /**
     * @ngdoc calendarFactory.method
     * @methodOf krushaTV.service:calendarFactory
     * @name calendarFactory#lastDayOfMonth
     * @description returns the last day of the specified month (e.g. 31 for december, 30 for november)
     * @param {Number} year year
     * @param {Number} month month
     * @return {Number} last day of the month
     */
    calendar.prototype.lastDayOfMonth = function(year, month) {
        var d = new Date(year, month, 0);
        return d.getDate();
    };

    /**
     * @ngdoc calendarFactory.method
     * @methodOf krushaTV.service:calendarFactory
     * @name calendarFactory#getDays
     * @description creates an array with entries for every day of the month and the previous and following days (complete weeks, so first day in array is an monday and the last a sunday)
     * @param {Number} year year
     * @param {Number} month month
     * @return {Array} contains an entry for every day of the month
     */
    calendar.prototype.getDays = function(year, month) {
        var today = new Date();

        if (typeof year === 'undefined' || typeof month === 'undefined') {
            year = today.getFullYear();
            month = today.getMonth()+1;
        }

        var lastDay = this.lastDayOfMonth(year, month);
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
     * @ngdoc calendarFactory.method
     * @methodOf krushaTV.service:calendarFactory
     * @name calendarFactory#getDaysWeek
     * @description creates an array with entries for every day of the month and the previous and following days (complete weeks, so first day in array is an monday and the last a sunday)
     * @param {Date} first_day first day of the week
     * @param {Date} last_day last day of the week
     * @return {Array} contains an entry for every day of the week
     */
    calendar.prototype.getDaysWeek = function(first_day, last_day) {
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
     * @ngdoc calendarFactory.method
     * @methodOf krushaTV.service:calendarFactory
     * @name calendarFactory#getDaysDay
     * @description creates an array with an entry for one day
     * @param {Date} day day
     * @return {Array} contains an entry for one day
     */
    calendar.prototype.getDaysDay = function(day) {
        var days = [];

        days.push({
            'date': new Date(day), // without new Date every day ends up being the last day
            'active': true,
            'shows': []
        });

        return days;
    };

    /**
     * @ngdoc calendarFactory.method
     * @methodOf krushaTV.service:calendarFactory
     * @name calendarFactory#getAllMonth
     * @description returns array containing numbers one to twelve
     * @return {Array} month
     */
    calendar.prototype.getAllMonth = function() {
        var month = [];

        for (var i=1; i<=12; i++) {
            month.push(i);
        }

        return month;
    };

    /**
     * @ngdoc calendarFactory.method
     * @methodOf krushaTV.service:calendarFactory
     * @name calendarFactory#getAllYears
     * @description returns array containing years from 1950 to next year
     * @return {Array} years
     */
    calendar.prototype.getAllYears = function() {
        var years = [];
        var nextYear = new Date().getFullYear()+1;

        for (var i=nextYear; i>=1950; i--) {
            years.push(i);
        }

        return years;
    };

    /**
     * @ngdoc calendarFactory.method
     * @methodOf krushaTV.service:calendarFactory
     * @name calendarFactory#getWeekDay
     * @description returns the the name for a day of the week
     * @param {Number} day javascript's day of the week
     * @return {String} name of the weekday
     */
    calendar.prototype.getWeekDay = function(day) {
        day -= 1;

        if (day < 0) {
            day = 6;
        }

        return this.allWeekdays[day];
    };

    return calendar;
});