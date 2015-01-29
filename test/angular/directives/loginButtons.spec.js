describe('loginButtons', function() {
    beforeEach(module('krushaTV'));

    beforeEach(module('templates'));

    var $compile;
    var $rootScope;
    var element;

    var tpl = '<login-buttons></login-buttons>';

    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;

        element = $compile(tpl)($rootScope);
    }));

    it('should display the buttons', function() {
        $rootScope.$digest();

        expect(element.find('li > a.btn > i').length).toBe(3);
    });
});