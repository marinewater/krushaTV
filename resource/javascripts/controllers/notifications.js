/**
 * @ngdoc controller
 * @name krushaTV.controllers:notificationsCtrl
 * @description
 * Controller for notification display
 * @requires $scope
 * @requires krushaTV.service:notifications
 */
krusha.controller('notificationsCtrl', ['$scope', 'notifications', function($scope, notifications) {
    $scope.notifications = {};
    var index = 0;
    var i;

    $scope.$on('notification', function() {
        notifications.pop().forEach(function(note) {
            i = index++;
            $scope.notifications[i] = note;
        });
    });
}]);