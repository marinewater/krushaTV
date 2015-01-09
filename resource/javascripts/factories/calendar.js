krusha.factory('calendar', [function() {
    var lastDayOfMonth = function(year, month) {
        var d = new Date(year, month, 0);
        return d.getDate();
    };

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

    var getAllMonth = function() {
        var month = [];

        for (var i=1; i<=12; i++) {
            month.push(i);
        }

        return month;
    };

    var allWeekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    return {
        getAllMonth: getAllMonth,
        allWeekdays: allWeekdays,
        getDays: getDays
    }
}]);