describe('interceptor', function() {
    var $httpProvider;
    var $httpBackend;

    beforeEach(module('krushaTV', function(_$httpProvider_) {
        $httpProvider = _$httpProvider_;
    }));

    var interceptor;

    beforeEach(inject(function(_interceptor_, $injector) {
        interceptor = _interceptor_;
        $httpBackend = $injector.get('$httpBackend');
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should have interceptor be defined', function () {
        expect(interceptor).toBeDefined();
    });

    describe('HTTP tests', function() {
        it('should contain the interceptor', function () {
            expect($httpProvider.interceptors).toContain('interceptor');
        });

        it('response without error should be unaltered', function() {
            var response = {random: 'test', object: 1};
            expect(interceptor.response(response)).toBe(response);
        });

        describe('unauthorized', function() {
            it('redirect on unauthorized requests', inject(function($http, loggedin, redirect) {
                spyOn(loggedin, 'setStatus');
                spyOn(redirect, 'login');
                $httpBackend.when('GET', '/api/auth').respond(401, {name: 'test' });
                $http.get('/api/auth');
                $httpBackend.flush();

                expect(loggedin.setStatus).toHaveBeenCalledWith(false);
                expect(redirect.login).toHaveBeenCalledWith();
            }));

            it('do not redirect if already on login page', inject(function($http, loggedin, redirect) {
                spyOn(loggedin, 'setStatus');
                spyOn(redirect, 'login');
                $httpBackend.when('GET', '/api/auth').respond(401, {login: 'test' });
                $http.get('/api/auth');
                $httpBackend.flush();

                expect(loggedin.setStatus).toHaveBeenCalledWith(false);
                expect(redirect.login).not.toHaveBeenCalled();
            }));

            it('do not do anything if no error', inject(function($http, loggedin, redirect) {
                spyOn(loggedin, 'setStatus');
                spyOn(redirect, 'login');
                $httpBackend.when('GET', '/api/auth').respond(200, {login: 'test' });
                $http.get('/api/auth');
                $httpBackend.flush();

                expect(loggedin.setStatus).not.toHaveBeenCalled();
                expect(redirect.login).not.toHaveBeenCalled();
            }));
        });

        describe('rate limiting', function() {
            it('display notification if rate limited', inject(function($http, notifications) {
                var now = new Date();
                jasmine.clock().mockDate(now);
                var tenMinutes = new Date(now.getTime() + 10*60000);

                spyOn(notifications, 'add');
                $httpBackend.when('GET', '/api/search').respond(429, {error: {nextValidRequestDate: tenMinutes}});
                $http.get('/api/search');
                $httpBackend.flush();

                expect(notifications.add).toHaveBeenCalled();
                expect(notifications.add.calls.argsFor(0)[0]).toMatch(/^You made to many requests\. You can make next request in \d+ minutes and \d+ seconds\.$/);
            }));

            it('do not display the notification too often', inject(function($http, notifications) {
                var now = new Date();
                jasmine.clock().mockDate(now);
                var tenMinutes = new Date(now.getTime() + 10*60000);

                spyOn(notifications, 'add');
                $httpBackend.when('GET', '/api/search').respond(429, {error: {nextValidRequestDate: tenMinutes}});

                $http.get('/api/search');
                $httpBackend.flush();
                expect(notifications.add).toHaveBeenCalled();

                notifications.add.calls.reset();
                $http.get('/api/search');
                $httpBackend.flush();
                expect(notifications.add).not.toHaveBeenCalled();
            }));
        });
    });
});