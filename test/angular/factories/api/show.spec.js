describe('apiShow', function() {
    beforeEach(module('krushaTV'));

    var apiShow;
    var $httpBackend;

    beforeEach(inject(function(_apiShowFactory_, _$httpBackend_) {
        apiShow = new _apiShowFactory_();
        $httpBackend = _$httpBackend_;
    }));

    it('should add a show', function() {
        $httpBackend.expectPOST('/api/show/', {showid: 1234}).respond(200, {});
        apiShow.addShow(1234);
        $httpBackend.flush();
    });

    it('should get a show', function() {
        $httpBackend.expectGET('/api/show/1234').respond(200, {});
        apiShow.getShow(1234);
        $httpBackend.flush();
    });

    it('should get seasons for a show', function() {
        $httpBackend.expectGET('/api/show/1234/season').respond(200, {});
        apiShow.getSeasons(1234);
        $httpBackend.flush();
    });

    it('should get episodes for a seasons', function() {
        $httpBackend.expectGET('/api/show/1234/season/2/episodes').respond(200, {});
        apiShow.getEpisodes(1234, 2);
        $httpBackend.flush();
    });

    it('should get all tracked shows', function() {
        $httpBackend.expectGET('/api/track').respond(200, {});
        apiShow.getTracked();
        $httpBackend.flush();
    });

    it('should add a show to tracked shows', function() {
        $httpBackend.expectPOST('/api/track', {showid: 1234}).respond(200, {});
        apiShow.addTracked(1234);
        $httpBackend.flush();
    });

    it('should delete a show from tracked shows', function() {
        $httpBackend.expectDELETE('/api/track/1234').respond(200, {});
        apiShow.deleteTracked(1234);
        $httpBackend.flush();
    });

    it('should mark an episode as watched', function() {
        $httpBackend.expectPOST('/api/watched/episode', {'episodeid': 1234}).respond(200, {});
        apiShow.watchedEpisode(1234);
        $httpBackend.flush();
    });

    it('should mark an episode as unwatched', function() {
        $httpBackend.expectDELETE('/api/watched/episode/1234').respond(200, {});
        apiShow.notWatchedEpisode(1234);
        $httpBackend.flush();
    });

    it('should get unwatched episodes', function() {
        $httpBackend.expectGET('/api/unwatched').respond(200, {});
        apiShow.getUnwatched();
        $httpBackend.flush();
    });

    it('should get watched episodes', function() {
        $httpBackend.expectGET('/api/watched').respond(200, {});
        apiShow.getWatched();
        $httpBackend.flush();
    });

    it('should mark all episodes of a seasons as watched', function() {
        $httpBackend.expectPOST('/api/watched/season', {'showid': 1234, 'season_nr': 4}).respond(200, {});
        apiShow.markSeasonWatched(1234, 4);
        $httpBackend.flush();
    });

    it('should mark all episodes of a show as watched', function() {
        $httpBackend.expectPOST('/api/watched/show', {'showid': 1234}).respond(200, {});
        apiShow.markShowWatched(1234);
        $httpBackend.flush();
    });

    it('should mark all episodes of a show as unwatched', function() {
        $httpBackend.expectDELETE('/api/watched/show/1234').respond(200, {});
        apiShow.markShowNotWatched(1234);
        $httpBackend.flush();
    });

    it('should mark all episodes of a season as unwatched', function() {
        $httpBackend.expectDELETE('/api/watched/season/1234/4').respond(200, {});
        apiShow.markSeasonNotWatched(1234, 4);
        $httpBackend.flush();
    });

    it('should get all episodes from today', function() {
        $httpBackend.expectGET('/api/today').respond(200, {});
        apiShow.getTodaysEpisodes();
        $httpBackend.flush();
    });

    it('should get omdb data', function() {
        $httpBackend.expectGET('/api/omdb/tt1234567').respond(200, {});
        apiShow.getomdb('tt1234567');
        $httpBackend.flush();
    });

    it('should get all unwatched shows', function() {
        $httpBackend.expectGET('/api/unwatched/shows').respond(200, {});
        apiShow.getUnwatchedShows();
        $httpBackend.flush();
    });

    it('should get all unwatched seasons for a show', function() {
        $httpBackend.expectGET('/api/unwatched/shows/1234/seasons').respond(200, {});
        apiShow.getUnwatchedSeasons(1234);
        $httpBackend.flush();
    });

    it('should get all unwatched episodes for a season', function() {
        $httpBackend.expectGET('/api/unwatched/shows/1234/seasons/4/episodes').respond(200, {});
        apiShow.getUnwatchedEpisodes(1234, 4);
        $httpBackend.flush();
    });

    it('should get all watched shows', function() {
        $httpBackend.expectGET('/api/watched/shows').respond(200, {});
        apiShow.getWatchedShows();
        $httpBackend.flush();
    });

    it('should get all watched seasons for a show', function() {
        $httpBackend.expectGET('/api/watched/shows/1234/seasons').respond(200, {});
        apiShow.getWatchedSeasons(1234);
        $httpBackend.flush();
    });

    it('should get all watched episodes for a season', function() {
        $httpBackend.expectGET('/api/watched/shows/1234/seasons/4/episodes').respond(200, {});
        apiShow.getWatchedEpisodes(1234, 4);
        $httpBackend.flush();
    });

    it('should get tracked episodes for a month', function() {
        $httpBackend.expectGET('/api/calendar/2014/12').respond(200, {});
        apiShow.getEpisodesMonth(12, 2014);
        $httpBackend.flush();
    });

    it('should get tracked episodes for a week', function() {
        $httpBackend.expectGET('/api/calendar/2014/12/31/week').respond(200, {});
        apiShow.getEpisodesWeek(31, 12, 2014);
        $httpBackend.flush();
    });

    it('should get tracked episodes for a day', function() {
        $httpBackend.expectGET('/api/calendar/2014/12/31').respond(200, {});
        apiShow.getEpisodesDay(31, 12, 2014);
        $httpBackend.flush();
    });
});