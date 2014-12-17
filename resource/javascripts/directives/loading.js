/**
 * @ngdoc directive
 * @name krushaTV.directive:loadingspinner
 * @description displays a loading animation if any $http request is in process
 * @restrict E
 */
krusha.directive('loadingspinner',   ['$http' ,function ($http) {
    return {
        restrict: 'E',
        link: function ($scope, elm)
        {
            $scope.isLoading = function () {
                return $http.pendingRequests.length > 0;
            };

            $scope.$watch($scope.isLoading, function (v)
            {
                if (v) {
                    elm.show();
                } else {
                    elm.hide();
                }
            });
        },
        template: '<div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>'
    };
}]);

/**
 * @ngdoc directive
 * @name krushaTV.directive:loadingcontent
 * @description hides the element it is attributed to if any $http request is in process
 * @restrict A
 */
krusha.directive('loadingcontent',   ['$http' ,function ($http) {
    return {
        restrict: 'A',
        link: function (scope, elm)
        {
            scope.isLoading = function () {
                return $http.pendingRequests.length > 0;
            };

            scope.$watch(scope.isLoading, function (v)
            {
                if(v){
                    elm.hide();
                } else {
                    elm.show();
                }
            });
        }
    };
}]);