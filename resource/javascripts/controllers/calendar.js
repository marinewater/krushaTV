/**
 * @ngdoc controller
 * @name krushaTV.controllers:calendarCtrl
 * @description
 * Controller for calendar.html template
 * @requires $scope
 * @requires krushaTV.service:apiShowFactory
 */
krusha.controller('calendarCtrl', ['$scope', 'apiShowFactory', function($scope, apiShowFactory) {
    var apiShow = new apiShowFactory();
    
    /**
     * set title of html page
     * @type {string}
     */
    $scope.$parent.title = 'Calendar';

    /**
     * @ngdoc calendarCtrl.method
     * @name calendarCtrl#getShowsMonth
     * @description gets show for specified month
     * @methodOf krushaTV.controllers:calendarCtrl
     */
    $scope.getShowsMonth = function(year, month) {
        return apiShow.getEpisodesMonth(month, year);
    };

    /**
     * @ngdoc calendarCtrl.method
     * @name calendarCtrl#getShowsWeek
     * @description gets show for specified week
     * @methodOf krushaTV.controllers:calendarCtrl
     */
    $scope.getShowsWeek = function(year, month, day) {
        return apiShow.getEpisodesWeek(day, month, year);
    };


    /**
     * @ngdoc calendarCtrl.method
     * @name calendarCtrl#getShowsDay
     * @description gets show for specified day
     * @methodOf krushaTV.controllers:calendarCtrl
     */
    $scope.getShowsDay = function(year, month, day) {
        return apiShow.getEpisodesDay(day, month, year);
    };
}]);