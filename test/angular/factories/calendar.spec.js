describe('calendar factory', function() {
    beforeEach(module('krushaTV'));

    var calendar;

    beforeEach(inject(function(_calendar_) {
        calendar = _calendar_;
    }));

    it('should return 7 weekdays', function() {
        expect(calendar.allWeekdays.length).toBe(7);
    });

    it('should return 12 month', function() {
        expect(calendar.getAllMonth().length).toBe(12);
    });

    it('should return 28 days', function() {
        var days = calendar.getDays(2014, 2);
        expect(days.length).toBe(35);

        var actual_days = 0;

        days.forEach(function(day) {
            if (!!day.active) {
                actual_days += 1;
            }
        });

        expect(actual_days).toBe(28);
        expect(days[5].date).toEqual(new Date(2014, 1, 1, 0, 0, 0));
    });

    it('should return 29 days', function() {
        var days = calendar.getDays(2012, 2);
        expect(days.length).toBe(35);

        var actual_days = 0;

        days.forEach(function(day) {
            if (!!day.active) {
                actual_days += 1;
            }
        });

        expect(actual_days).toBe(29);
    });

    it('should return 31 days', function() {
        var days = calendar.getDays(2015, 12);
        expect(days.length).toBe(35);

        var actual_days = 0;

        days.forEach(function(day) {
            if (!!day.active) {
                actual_days += 1;
            }
        });

        expect(actual_days).toBe(31);
    });

    it('should return 30 days', function() {
        var days = calendar.getDays(2015, 11);
        expect(days.length).toBe(42);

        var actual_days = 0;

        days.forEach(function(day) {
            if (!!day.active) {
                actual_days += 1;
            }
        });

        expect(actual_days).toBe(30);
    });

    it('should return the current month', function() {
        jasmine.clock().mockDate(new Date(2014, 8, 2));

        var days = calendar.getDays();
        expect(days.length).toBe(35);

        var actual_days = 0;

        days.forEach(function(day) {
            if (!!day.active) {
                actual_days += 1;
            }
        });

        expect(actual_days).toBe(30);
    })
});