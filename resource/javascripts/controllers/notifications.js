/**
 * @ngdoc controller
 * @name krushaTV.controllers:notificationsCtrl
 * @description
 * Controller for notification display
 * @requires $scope
 * @requires krushaTV.service:notificationsFactory
 */
krusha.controller('notificationsCtrl', ['$scope', 'notificationsFactory', function($scope, notificationsFactory) {
    var notifications = new notificationsFactory();
    
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