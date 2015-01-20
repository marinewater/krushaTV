/**
 * @ngdoc directive
 * @name krushaTV.directive:success
 * @description displays an symbol for a specified amount of time to indicate if a action has failed or succeeded
 * @restrict E
 * @scope
 * @param {number} timeout timeout in milliseconds
 * @param {boolean} success true for success, false for error
 */
krusha.directive('success', ['$timeout', '$animate', function($timeout, $animate) {
    var link = function($scope, element) {
        element.hide();
        var timeout_promise = null;

        $scope.$watch('successHandler', function(newVal, oldVal) {
            if (newVal !== oldVal && newVal !== 'not') {
                $timeout.cancel(timeout_promise);
                $animate.addClass(element, 'fadeSuccess');
                $scope.success = $scope.successHandler;
                $scope.successHandler = 'not';

                timeout_promise = $timeout(function() {
                    $animate.removeClass(element, 'fadeSuccess');
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