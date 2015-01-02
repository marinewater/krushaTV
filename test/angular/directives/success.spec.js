describe('success', function() {
    beforeEach(module('krushaTV'));

    var $compile;
    var $rootScope;

    beforeEach(inject(function(_$compile_, _$rootScope_){
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should be invisible', function() {
        var element = $compile('<success timeout="5000" success="successVar"></success>')($rootScope);
        $rootScope.$digest();

        expect(element.css('display')).toBe('none');
    });

    it('should become visible and display Error', inject(function($timeout) {
        var element = $compile('<success timeout="5000" success="successVar"></success>')($rootScope);
        $rootScope.$digest();

        $rootScope.successVar = false;
        $rootScope.$digest();
        expect(element.hasClass('fadeSuccess')).toBeTruthy();
        expect(element.text()).toBe('Error');
        expect(element.children('span:first').hasClass('text-danger')).toBeTruthy();
        expect($rootScope.successVar).toBe('not');

        $timeout.flush();
        expect(element.hasClass('fadeSuccess')).toBeFalsy();
    }));

    it('should become visible and display a checkmark', inject(function($timeout) {
        var element = $compile('<success timeout="5000" success="successVar"></success>')($rootScope);
        $rootScope.$digest();

        $rootScope.successVar = true;
        $rootScope.$digest();
        expect(element.hasClass('fadeSuccess')).toBeTruthy();
        expect(element.text()).toBe('');
        expect(element.children('span:first').hasClass('text-success')).toBeTruthy();
        expect(element.children('span:first').hasClass('fa-check')).toBeTruthy();
        expect($rootScope.successVar).toBe('not');

        $timeout.flush();
        expect(element.hasClass('fadeSuccess')).toBeFalsy();
    }));
});