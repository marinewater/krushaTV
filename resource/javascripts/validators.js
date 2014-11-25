var reddit_regex = /^(?:http(?:s)?:\/\/)?(?:www\.)?(?:reddit\.com)?(\/r\/\w+)(?:[.?&/].*)?$/i;
var imdb_regex = /^(?:https?:\/\/)?(?:www.)?(?:imdb.com\/title\/)?(tt\d{7})(?:\/.*)?$/i;

krusha.directive('subreddit', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.subreddit = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty models to be valid
          return true;
        }

        if (reddit_regex.test(viewValue)) {
          // it is valid
          return true;
        }

        // it is invalid
        return false;
      };
    }
  };
});

krusha.directive('imdb', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.imdb = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty models to be valid
          return true;
        }

        if (imdb_regex.test(viewValue)) {
          // it is valid
          return true;
        }

        // it is invalid
        return false;
      };
    }
  };
});