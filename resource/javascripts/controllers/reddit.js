/**
 * @ngdoc controller
 * @name krushaTV.controllers:redditCtrl
 * @description
 * Controller for admin/reddit.html template
 * displays user submissions for subreddits and lets admins accept them
 * needs admin permissions
 * @requires $scope
 * @requires krushaTV.service:apiReddit
 */
krusha.controller('redditCtrl', ['$scope', 'apiReddit', function($scope, apiReddit) {
	/**
	 * @ngdoc redditCtrl.method
	 * @name redditCtrl#getSubreddits
	 * @description gets all user submitted subreddits from the api
	 * @methodOf krushaTV.controllers:redditCtrl
	 */
	var getSubreddits = function() {
		apiReddit.getSubmittedSubreddits().success(function(data) {
			$scope.subreddits = data.subreddits;
		}).error(function(err, code) {
			if (code === 404) {
				$scope.subreddits = null;
			}
		});
	};

	/**
	 * @ngdoc redditCtrl.method
	 * @name redditCtrl#acceptSub
	 * @description accepts a user submission for a subreddit
	 * @methodOf krushaTV.controllers:redditCtrl
	 * @param {number} submission_id unique id for the subreddit that will be accepted
	 */
	$scope.acceptSub = function(submission_id) {
		apiReddit.acceptSubmittedSubreddit(submission_id).success(function() {
			getSubreddits();
		});
	};

	getSubreddits();
}]);