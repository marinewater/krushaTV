/**
 * @ngdoc directive
 * @name krushaTV.directive:dailyepisodes
 * @description template for one episode in today's episodes overview page
 * @restrict E
 */
krusha.directive('dailyepisodes', [function() {
    return {
        restrict: 'E',
        templateUrl: '/static/templates/directives/dailyepisodes.html',
        replace: true
    }
}]);