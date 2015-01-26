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
            it('redirect on unauthorized requests', inject(function($http, loggedinFactory, redirectFactory) {
                spyOn(loggedinFactory.prototype, 'setStatus');
                spyOn(redirectFactory.prototype, 'login');
                $httpBackend.when('GET', '/api/auth').respond(401, {name: 'test' });
                $http.get('/api/auth');
                $httpBackend.flush();

                expect(loggedinFactory.prototype.setStatus).toHaveBeenCalledWith(false);
                expect(redirectFactory.prototype.login).toHaveBeenCalledWith();
            }));

            it('do not redirect if already on login page', inject(function($http, loggedinFactory, redirectFactory) {
                spyOn(loggedinFactory.prototype, 'setStatus');
                spyOn(redirectFactory.prototype, 'login');
                $httpBackend.when('GET', '/api/auth').respond(401, {login: 'test' });
                $http.get('/api/auth');
                $httpBackend.flush();

                expect(loggedinFactory.prototype.setStatus).toHaveBeenCalledWith(false);
                expect(redirectFactory.prototype.login).not.toHaveBeenCalled();
            }));

            it('do not do anything if no error', inject(function($http, loggedinFactory, redirectFactory) {
                spyOn(loggedinFactory.prototype, 'setStatus');
                spyOn(redirectFactory.prototype, 'login');
                $httpBackend.when('GET', '/api/auth').respond(200, {login: 'test' });
                $http.get('/api/auth');
                $httpBackend.flush();

                expect(loggedinFactory.prototype.setStatus).not.toHaveBeenCalled();
                expect(redirectFactory.prototype.login).not.toHaveBeenCalled();
            }));
        });

        describe('rate limiting', function() {
            it('display notification if rate limited', inject(function($http, notificationsFactory) {
                var now = new Date();
                jasmine.clock().mockDate(now);
                var tenMinutes = new Date(now.getTime() + 10*60000);

                spyOn(notificationsFactory.prototype, 'add');
                $httpBackend.when('GET', '/api/search').respond(429, {error: {nextValidRequestDate: tenMinutes}});
                $http.get('/api/search');
                $httpBackend.flush();

                expect(notificationsFactory.prototype.add).toHaveBeenCalled();
                expect(notificationsFactory.prototype.add.calls.argsFor(0)[0]).toMatch(/^You made to many requests\. You can make the next request in \d+ minutes and \d+ seconds\.$/);
            }));

            it('do not display the notification too often', inject(function($http, notificationsFactory) {
                var now = new Date();
                jasmine.clock().mockDate(now);
                var tenMinutes = new Date(now.getTime() + 10*60000);

                spyOn(notificationsFactory.prototype, 'add');
                $httpBackend.when('GET', '/api/search').respond(429, {error: {nextValidRequestDate: tenMinutes}});

                $http.get('/api/search');
                $httpBackend.flush();
                expect(notificationsFactory.prototype.add).toHaveBeenCalled();

                notificationsFactory.prototype.add.calls.reset();
                $http.get('/api/search');
                $httpBackend.flush();
                expect(notificationsFactory.prototype.add).not.toHaveBeenCalled();
            }));
        });
        
        describe('Service Unavailable', function() {
            it('display notification if rate limited', inject(function($http, notificationsFactory) {
                spyOn(notificationsFactory.prototype, 'add');
                $httpBackend.when('POST', '/api/search/test/remote').respond(503, {
                    type: 'error',
                    code: 503,
                    message: 'We cannot retrieve this show at the moment, please try again later.'
                });
                $http.post('/api/search/test/remote');
                $httpBackend.flush();

                expect(notificationsFactory.prototype.add).toHaveBeenCalled();
                expect(notificationsFactory.prototype.add.calls.argsFor(0)[0]).toBe('We cannot retrieve this show at the moment, please try again later.');
                expect(notificationsFactory.prototype.add.calls.argsFor(0)[1]).toBe('danger');
                expect(notificationsFactory.prototype.add.calls.argsFor(0)[2]).toBe(20000);
                expect(notificationsFactory.prototype.add.calls.argsFor(0)[1]).toBeTruthy();
            }));
        });
    });
});