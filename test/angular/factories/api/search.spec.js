describe('apiSearch', function() {
    beforeEach(module('krushaTV'));

    var apiSearch;
    var $httpBackend;

    beforeEach(inject(function(_apiSearch_, _$httpBackend_) {
        apiSearch = _apiSearch_;
        $httpBackend = _$httpBackend_;
    }));

    it('search in the database', function() {
        $httpBackend.expectGET('/api/search/abc').respond(200);
        apiSearch.searchLocal('abc');
        $httpBackend.flush();
    });

    it('should not search if the length is smaller than 2 (local)', function() {
        // ToDo
    });


    it('search in the external api', function() {
        $httpBackend.expectGET('/api/search/abc/remote').respond(200);
        apiSearch.searchRemote('abc');
        $httpBackend.flush();
    });

    it('should not search if the length is smaller than 3 (remote)', function() {
        // ToDo
    });
});