describe('apiAuth', function() {
    beforeEach(module('krushaTV'));

    var apiAuth;
    var $httpBackend;

    beforeEach(inject(function(_apiAuth_, _$httpBackend_) {
        apiAuth = _apiAuth_;
        $httpBackend = _$httpBackend_;
    }));

    it('should login for the length of a session if no keep_logged_in parameter is specified', function() {
        $httpBackend.expectPOST('/api/login', {'username': 'test', 'password': 'asd123456', 'keep_logged_in': false}).respond(200, {});
        apiAuth.login('test', 'asd123456');
        $httpBackend.flush();
    });

    it('should login session', function() {
        $httpBackend.expectPOST('/api/login', {'username': 'test', 'password': 'asd123456', 'keep_logged_in': false}).respond(200, {});
        apiAuth.login('test', 'asd123456', false);
        $httpBackend.flush();
    });

    it('should login permanent', function() {
        $httpBackend.expectPOST('/api/login', {'username': 'test', 'password': 'asd123456', 'keep_logged_in': true}).respond(200, {});
        apiAuth.login('test', 'asd123456', true);
        $httpBackend.flush();
    });

    it('should logout', function() {
        $httpBackend.expectGET('/api/logout').respond(200);
        apiAuth.logout();
        $httpBackend.flush();
    });

    it('should signup', function() {
        $httpBackend.expectPOST('/api/signup', {'username': 'test user', 'password': 'test password', 'captcha': 'someObscureNumbers232andStuff'}).respond(200);
        apiAuth.signup('test user', 'test password', 'someObscureNumbers232andStuff');
        $httpBackend.flush();
    });

    it('should get the login status', function() {
        $httpBackend.expectGET('/api/status').respond(200);
        apiAuth.loginStatus();
        $httpBackend.flush();
    });
});