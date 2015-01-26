describe('apiSearch', function() {
    beforeEach(module('krushaTV'));

    var apiSearch;
    var $httpBackend;
    var $rootScope;

    beforeEach(inject(function(_apiSearchFactory_, _$httpBackend_, _$rootScope_) {
        apiSearch = new _apiSearchFactory_();
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
    }));

    it('search in the database', function() {
        $httpBackend.expectGET('/api/search/abc').respond(200);
        apiSearch.searchLocal('abc');
        $httpBackend.flush();
    });

    it('should not search if the length is smaller than 2 (local)', function() {
        var error = null;
        apiSearch.searchLocal('a').then(function() {
            expect(true).toBeFalsy();
        }, function(data) {
            error = data;
        });
        
        $rootScope.$digest();
        
        expect(error.type).toBe('error');
        expect(error.code).toBe(400);
    });


    it('search in the external api', function() {
        $httpBackend.expectGET('/api/search/abc/remote').respond(200);
        apiSearch.searchRemote('abc');
        $httpBackend.flush();
    });

    it('should not search if the length is smaller than 3 (remote)', function() {
        var error = null;
        apiSearch.searchRemote('ab').then(function() {
            expect(true).toBeFalsy();
        }, function(data) {
            error = data;
        });

        $rootScope.$digest();

        expect(error.type).toBe('error');
        expect(error.code).toBe(400);
    });
});