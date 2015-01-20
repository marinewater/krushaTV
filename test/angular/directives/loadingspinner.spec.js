describe('loadingspinner', function() {
    beforeEach(module('krushaTV'));

    var $compile;
    var $rootScope;

    beforeEach(inject(function(_$compile_, _$rootScope_){
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should be hidden', function() {
        var element = $compile("<loadingspinner></loadingspinner>")($rootScope);
        $rootScope.$digest();

        expect(element.children("div:first").hasClass('ng-hide')).toBeTruthy();
    });

    it('should become visible', inject(function($httpBackend, $http) {
        $httpBackend.when('GET', '/api/test').respond(200, {name: 'test' });
        var element = $compile("<loadingspinner></loadingspinner>")($rootScope);
        $http.get('/api/test');
        $rootScope.$digest();

        expect(element.children("div:first").hasClass('ng-hide')).toBeFalsy();

        $httpBackend.flush();
        $rootScope.$digest();

        expect(element.children("div:first").hasClass('ng-hide')).toBeTruthy();
    }));
});