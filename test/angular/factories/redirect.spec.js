describe('search_text', function() {

    beforeEach(module('krushaTV'));

    var redirect;

    beforeEach(inject(function(_redirectFactory_) {
        redirect = new _redirectFactory_();
    }));

    describe('login', function() {
        it('should redirect to login', inject(function($location) {
            spyOn($location, 'path');
            redirect.login();
            expect($location.path).toHaveBeenCalled();
        }));
    });

    describe('back', function() {
        it('should redirect to homepage', inject(function($location) {
            spyOn($location, 'path');
            redirect.back();
            expect($location.path).toHaveBeenCalled();
            expect($location.path.calls.mostRecent().args[0]).toEqual('/');
        }));

        it('should redirect to profile', inject(function($location) {
            $location.path('/profile');
            redirect.login();

            spyOn($location, 'path');
            redirect.back();
            expect($location.path).toHaveBeenCalled();
            expect($location.path.calls.mostRecent().args[0]).toEqual('/profile');
        }));

        it('should not redirect to login', inject(function($location) {
            $location.path('/login');
            redirect.login();

            spyOn($location, 'path');
            redirect.back();
            expect($location.path).toHaveBeenCalled();
            expect($location.path.calls.mostRecent().args[0]).toEqual('/');
        }));
    });
});