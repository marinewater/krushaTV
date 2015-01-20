var reddit_regex = /^(?:http(?:s)?:\/\/)?(?:www\.)?(?:reddit\.com)?(\/r\/\w+)(?:[.?&/]{1}.*)?$/i;
var imdb_regex = /^(?:https?:\/\/)?(?:www.)?(?:imdb.com\/title\/)?(tt\d{7})(?:\/.*)?$/i;

/**
 * @ngdoc directive
 * @name krushaTV.directive:subreddit
 * @description validator for reddit urls
 * @requires ngModel
 */
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

/**
 * @ngdoc directive
 * @name krushaTV.directive:imdb
 * @description validator for imdb urls
 * @requires ngModel
 */
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