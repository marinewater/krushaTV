describe('slider', function() {
    beforeEach(module('krushaTV'));

    beforeEach(module('templates'));

    var $compile;
    var $rootScope;
    var element;

    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should display the slider', function() {
        element = $compile('<slider></slider>')($rootScope);
        $rootScope.$digest();

        expect(element.find('div:first').hasClass('bar')).toBeTruthy();
        expect(element.find('.handle:first').attr('tooltip-placement')).toBe('top');
    });

    it('should place tooltips at the right position', function() {
        element = $compile('<slider tooltip-placement="right"></slider>')($rootScope);
        $rootScope.$digest();

        expect(element.find('.handle:first').attr('tooltip-placement')).toBe('right');
    });
});