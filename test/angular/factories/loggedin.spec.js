describe('loggedin', function() {
    beforeEach(module('krushaTV'));

    var loggedin;

    beforeEach(inject(function(_loggedin_) {
        loggedin = _loggedin_;
    }));

    describe('no event broadcasting', function() {
        var $rootScope;

        beforeEach(inject(function(_$rootScope_) {
            $rootScope = _$rootScope_;
        }));

        it('should get the login status: not logged in', function() {
            expect(loggedin.getStatus()).toBeFalsy();
        });

        it('should get no user name if not logged in', function() {
            expect(loggedin.getUser()).toBeNull();
        });

        it('should set a user name', function() {
            loggedin.setUser('test');
            expect(loggedin.getUser()).toBe('test');
        });

        it('should get iso date format if not logged in', function() {
            expect(loggedin.getDateFormat()).toBe('yyyy-MM-dd');
        });

        it('should set a date format', function() {
            loggedin.setDateFormat('dd.MM.yyyy');
            expect(loggedin.getDateFormat()).toBe('dd.MM.yyyy');
        });
    });

    describe('with event broadcasting', function() {
        it('should log a user in', inject(function($rootScope) {
            spyOn($rootScope, '$broadcast');
            loggedin.setStatus(true);

            expect($rootScope.$broadcast).toHaveBeenCalledWith('loggedin');
            expect(loggedin.getStatus()).toBeTruthy();
        }));
    });
});