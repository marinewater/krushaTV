describe('dailyepisodes', function() {
    beforeEach(module('krushaTV'));

    beforeEach(module('templates'));

    var $compile;
    var $rootScope;
    var element;

    var tpl = '<dailyepisodes></dailyepisodes>';

    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;

        element = $compile(tpl)($rootScope);
    }));

    it('should load the template', function() {
        $rootScope.$digest();
        expect(element.hasClass('dailyepisodes')).toBeTruthy();
    });

    it('should display data', function() {
        $rootScope.episode = {
            title: 'title',
            showname: 'show',
            showid: 23,
            season: 2,
            episode: 3
        };
        $rootScope.$digest();

        var anchor = element.find('h3:first >a');
        expect(anchor.text()).toBe('show');
        expect(anchor.attr('href')).toBe('/show/23?season=2');

        expect(element.find('p:first strong').text()).toBe('title');

        expect(element.find('p.pull-left-lg:first').text()).toBe('S02E03');
    });
});