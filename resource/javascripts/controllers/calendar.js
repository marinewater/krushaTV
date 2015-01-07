krusha.controller('calendarCtrl', ['$scope', 'apiShow', function($scope, apiShow) {
    $scope.$parent.title = 'Calendar';

    $scope.getShows = function(year, month) {
        return apiShow.getEpisodesMonth(month, year);
    };
}]);