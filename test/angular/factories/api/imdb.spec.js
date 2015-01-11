describe('apiImdb', function() {
    beforeEach(module('krushaTV'));

    var apiImdb;
    var $httpBackend;

    beforeEach(inject(function(_apiImdb_, _$httpBackend_) {
        apiImdb = _apiImdb_;
        $httpBackend = _$httpBackend_;
    }));

    it('should send imdb id to api', function() {
        $httpBackend.expectPOST('/api/imdb', {'imdb_id': 'tt1234567', 'showid': 1234}).respond(200, {});
        apiImdb.submitIMDbId('tt1234567', '1234');
        $httpBackend.flush();
    });

    it('should get all imdb ids', function() {
        $httpBackend.expectGET('/api/admin/imdb').respond(200, {});
        apiImdb.getSubmittedIMDbIds();
        $httpBackend.flush();
    });

    it('should accept a submission', function() {
        $httpBackend.expectPUT('/api/admin/imdb/6234').respond(200, {});
        apiImdb.acceptSubmittedIMDbID(6234);
        $httpBackend.flush();
    });


});