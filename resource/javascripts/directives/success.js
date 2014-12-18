/**
 * @ngdoc directive
 * @name krushaTV.directive:success
 * @description displays an symbol for a specified amount of time to indicate if a action has failed or succeeded
 * @restrict E
 * @scope
 * @param {number} timeout timeout in milliseconds
 * @param {boolean} success true for success, false for error
 */
krusha.directive('success', ['$timeout', function($timeout) {
    var link = function($scope, element) {
        var timeout_promise = null;
        $scope.$watch('successHandler', function(newVal, oldVal) {
            if (newVal !== oldVal && newVal !== 'not') {
                $timeout.cancel(timeout_promise);
                element.fadeIn(100);
                $scope.success = $scope.successHandler;
                $scope.successHandler = 'not';

                timeout_promise = $timeout(function() {
                    element.fadeOut();
                }, $scope.timeout);
            }
        }, true);
    };

    return {
        restrict: 'E',
        scope: {
            timeout: '@timeout',
            successHandler: '=success'
        },
        template: '<span ng-class="{\'text-success fa fa-check\': !!success, \'text-danger\': !success}">{{ success === false ? \'Error\' : \'\' }}</span>',
        link: link
    };
}]);