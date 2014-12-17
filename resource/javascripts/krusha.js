/**
 * @ngdoc overview
 * @name krushaTV
 *
 * @description krushaTV: episode tracking app
 */
var krusha = angular.module('krushaTV', ['ngRoute', 'ngAnimate', 'ngCookies', 'ngSanitize', 'ui.bootstrap', 'growlNotifications', 'ngClipboard']);


krusha.config(['$routeProvider', '$httpProvider', '$compileProvider', '$locationProvider', '$tooltipProvider', 'ngClipProvider',
	function ($routeProvider, $httpProvider, $compileProvider, $locationProvider, $tooltipProvider, ngClipProvider) {
        // Routes
		$routeProvider
            .when('/', {
                templateUrl: '/static/templates/today.html',
                controller: 'todayCtrl'
            })
            .when('/search', {
                templateUrl: '/static/templates/search.html',
                controller: 'searchCtrl'
            })
            .when('/show/:id', {
                templateUrl: '/static/templates/show.html',
                controller: 'showCtrl'
            })
            .when('/login', {
                templateUrl: '/static/templates/login.html',
                controller: 'loginCtrl'
            })
            .when('/signup', {
                templateUrl: '/static/templates/signup.html',
                controller: 'signupCtrl'
            })
            .when('/track', {
                templateUrl: '/static/templates/track.html',
                controller: 'trackCtrl'
            })
            .when('/admin/reddit', {
                templateUrl: '/static/templates/admin/reddit.html',
                controller: 'redditCtrl'
            })
            .when('/admin/imdb', {
                templateUrl: '/static/templates/admin/imdb.html',
                controller: 'imdbCtrl'
            })
            .when('/profile', {
                templateUrl: '/static/templates/profile.html',
                controller: 'profileCtrl'
            })
            .when('/unwatched', {
                templateUrl: '/static/templates/unwatched.html',
                controller: 'unwatchedCtrl'
            })
            .when('/watched', {
                templateUrl: '/static/templates/watched.html',
                controller: 'watchedCtrl'
            }).
            otherwise({
                redirectTo: '/'
            });

        $httpProvider.interceptors.push('interceptor');
        $compileProvider.debugInfoEnabled(true);  // change to false for production
        $locationProvider.html5Mode(true);
        $tooltipProvider.setTriggers({'slideStartEvent': 'slideStopEvent'});
        ngClipProvider.setPath("/static/javascripts/bower_components/zeroclipboard/dist/ZeroClipboard.swf");
	}
]);

krusha.controller('navCtrl', [function() {
}]);
krusha.controller('parentCtrl', ['$scope', function($scope){
    $scope.title = '';
}]);