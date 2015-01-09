describe('dates', function() {
    beforeEach(module('krushaTV'));

    beforeEach(module('templates'));

    var $compile;
    var $rootScope;
    var element;

    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should do nothing', function() {
        element = $compile('<table><tbody dates></tbody></table>')($rootScope);
        $rootScope.$digest();
        expect(element.children('tbody:first').children().length).toBe(0);
    });

    describe('with data', function() {
        beforeEach(function() {
            element = $compile('<table><tbody dates days="days"></tbody></table>')($rootScope);
        });

        it('should display one day', function() {
            $rootScope.days = [{
                date: new Date(2014, 1, 1),
                shows: [{
                    id: 1,
                    name: 'test',
                    episode: 24,
                    season: 2
                }]
            }];

            $rootScope.$digest();

            expect(element.children('tbody:first').children().length).toBe(1);

            var date_cell = element.find('tbody:first tr:first td:first');
            expect(date_cell.find('div.date').text()).toBe('1');
            expect(date_cell.find('li').length).toBe(1);

            var show = date_cell.find('li:first');
            expect(show.find('a').attr('href')).toBe('/show/1');
            expect(show.find('a').text()).toBe('test');
            expect(show.text()).toBe('test - S02E24');
        });
    });
});