describe('apiSettings', function() {
    beforeEach(module('krushaTV'));

    var apiSettings;
    var $httpBackend;

    beforeEach(inject(function(_apiSettingsFactory_, _$httpBackend_) {
        apiSettings = new _apiSettingsFactory_();
        $httpBackend = _$httpBackend_;
    }));

    it('should send episode offset to api', function() {
        $httpBackend.expectPUT('/api/profile/settings/episode-offset', {'offset': { 'days': 1, 'hours': 5 }}).respond(200, {});
        apiSettings.setEpisodeOffset(1, 5);
        $httpBackend.flush();
    });

    it('should get the profile from the api', function() {
        $httpBackend.expectGET('/api/profile').respond(200, {});
        apiSettings.getProfile();
        $httpBackend.flush();
    });

    it('should send the date format to the api', function() {
        $httpBackend.expectPUT('/api/profile/settings/date-format', {'date_format': 'yyyy-MM-dd'}).respond(200, {});
        apiSettings.setDateFormat('yyyy-MM-dd');
        $httpBackend.flush();
    });
});