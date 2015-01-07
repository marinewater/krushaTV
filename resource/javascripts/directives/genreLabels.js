/**
 * @ngdoc directive
 * @name krushaTV.directive:genreLabels
 * @description splits a string of genres up and creates a bootstrap label for each genre
 * @restrict E
 * @param {string} genres string of genres, seperated by ", "
 */
krusha.directive('genreLabels', [function() {
    var link = function($scope, element, attrs) {
        var unwatch = $scope.$watch(attrs.genres, function(value) {
            if (typeof value !== 'undefined') {
                $scope.genres = value.length > 0 ? value.split(', ') : null;
                unwatch();
            }
        });
    };

    return {
        restrict: 'E',
        link: link,
        template: '<span class="label label-default" ng-repeat="genre in ::genres">{{ ::genre }}</span>'
    };
}]);