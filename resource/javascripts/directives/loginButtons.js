krusha.directive('loginButtons', function() {
    return {
        restrict: 'A',
        template: '<li><a href="/auth/reddit" class="btn btn-default" target="_self"><i class="fa fa-reddit"></i> Reddit</a></li><li><a href="/auth/google" class="btn btn-danger" target="_self"><i class="fa fa-google"></i> Google</a></li><li><a href="/auth/facebook" class="btn btn-primary" target="_self"><i class="fa fa-facebook"></i> Facebook</a></li>'
    }
});