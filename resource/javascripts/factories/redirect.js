/**
 * @ngdoc service
 * @name krushaTV.service:redirectFactory
 * @description stores the last known url and redirectFactorys back to it after logging in
 * @requires $location
 */
krusha.factory('redirectFactory', ['$location', function($location) {
    /**
     * last known location/url before login
     * @type {null|string}
     */
    var last_location = null;

    var redirect = function() {};

    /**
     * @ngdoc redirectFactory.method
     * @methodOf krushaTV.service:redirectFactory
     * @name redirectFactory#login
     * @description stores the current location and redirectFactorys to the login page
     */
    redirect.prototype.login = function() {
        last_location = $location.path();
        $location.path('/login');
    };

    /**
     * @ngdoc redirectFactory.method
     * @methodOf krushaTV.service:redirectFactory
     * @name redirectFactory#back
     * @description redirectFactorys to the last known location
     */
    redirect.prototype.back = function() {
        if (last_location != null && last_location != '/login') {
            $location.path(last_location);
        }
        else {
            $location.path('/');
        }
    };
    
    return redirect;
}]);