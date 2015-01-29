describe('scrollfix', function() {
    beforeEach(module('krushaTV'));

    var $compile;
    var $rootScope;

    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('seasons should be relative', function() {
        var element = $compile('<div scrollfix><div id="seasons" style="height: 2px;"></div><div id="episodes" style="height: 1px;"></div></div>')($rootScope);
        updateOffset();
        expect(element.find('#seasons').attr('class')).toBe('seasons-relative');
    });

    it('seasons should be fixed', function() {
        var element = $compile('<div scrollfix><div id="seasons" style="height: 1px;"></div><div id="episodes" style="height: 2px;"></div></div>')($rootScope);
        updateOffset();
        expect(element.find('#seasons').attr('class')).toBe('seasons-fixed');
    });
});