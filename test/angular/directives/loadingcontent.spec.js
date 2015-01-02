describe('loadingcontent', function() {
    beforeEach(module('krushaTV'));

    var $compile;
    var $rootScope;

    beforeEach(inject(function(_$compile_, _$rootScope_){
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should be visible', function() {
        var element = $compile('<div loadingcontent>test</div>')($rootScope);
        $rootScope.$digest();

        expect(element.css('display')).toBe('block');
    });

    it('should become invisible', inject(function($httpBackend, $http) {
        $httpBackend.when('GET', '/api/test').respond(200, {name: 'test' });
        $http.get('/api/test');
        var element = $compile('<div loadingcontent>test</div>')($rootScope);
        $rootScope.$digest();

        expect(element.css('display')).toBe('none');

        $httpBackend.flush();
        expect(element.css('display')).toBe('block');
    }));
});