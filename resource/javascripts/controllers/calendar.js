krusha.controller('calendarCtrl', ['$scope', 'apiShow', function($scope, apiShow) {
    $scope.$parent.title = 'Calendar';

    $scope.getShowsMonth = function(year, month) {
        return apiShow.getEpisodesMonth(month, year);
    };

    $scope.getShowsWeek = function(year, month, day) {
        return apiShow.getEpisodesWeek(day, month, year);
    };
}]);