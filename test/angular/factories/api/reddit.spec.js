describe('apiReddit', function() {
    beforeEach(module('krushaTV'));

    var apiReddit;
    var $httpBackend;

    beforeEach(inject(function(_apiRedditFactory_, _$httpBackend_) {
        apiReddit = new _apiRedditFactory_();
        $httpBackend = _$httpBackend_;
    }));

    it('should send a subreddit to the api', function() {
        $httpBackend.expectPOST('/api/subreddit', {'subreddit': '/r/a_Test', 'showid': 1234}).respond(200, {});
        apiReddit.submitSubreddit('/r/a_Test', 1234);
        $httpBackend.flush();
    });

    it('should get all subreddits', function() {
        $httpBackend.expectGET('/api/admin/subreddit').respond(200, {});
        apiReddit.getSubmittedSubreddits();
        $httpBackend.flush();
    });

    it('should accept a submission', function() {
        $httpBackend.expectPUT('/api/admin/subreddit/6234').respond(200, {});
        apiReddit.acceptSubmittedSubreddit(6234);
        $httpBackend.flush();
    });
});