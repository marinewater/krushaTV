/**
 * @ngdoc controller
 * @name krushaTV.controllers:signupCtrl
 * @description
 * Controller for signup.html template
 * @requires $scope
 * @requires $location
 * @requires krushaTV.service:apiAuth
 * @requires krushaTV.service:notifications
 * @requires krushaTV.service:loggedin
 */
krusha.controller('signupCtrl', ['$scope', '$location', 'apiAuth', 'notifications', 'loggedin',
	function($scope, $location, apiAuth, notifications, loggedin) {
		/**
		 * error messages as infos
		 * @type {Array}
		 */
		$scope.alerts = [];

		/**
		 * @ngdoc signupCtrl.method
		 * @name signupCtrl#loggedin_func
		 * @description checks if a user is logged in and redirects to the homepage if he is
		 * @methodOf krushaTV.controllers:signupCtrl
		 */
		var loggedin_func = function() {
			apiAuth.loginStatus().success(function() {
				$location.path('/');
			});
		};

		/**
		 * @ngdoc signupCtrl.method
		 * @name signupCtrl#closeAlert
		 * @description removes an alert
		 * @methodOf krushaTV.controllers:signupCtrl
		 * @param {number} index index of the alert that should be removed
		 */
		$scope.closeAlert = function(index) {
			$scope.alerts.splice(index, 1);
		};

		/**
		 * @ngdoc signupCtrl.method
		 * @name signupCtrl#signup
		 * @description registers a new user
		 * @methodOf krushaTV.controllers:signupCtrl
		 * @param {string} username username
		 * @param {string} password password (has to be at least 6 characters long)
		 */
		$scope.signup = function(username, password) {
			apiAuth.signup(username, password)
				.success(function(data) {
					loggedin.setStatus(true);
					notifications.add('Welcome ' + data.user + '!', 'success', 5000);
					$location.path("/");
				})
				.error(function(err) {
					$scope.alerts.push({
						'type': 'danger',
						'msg': err.message
					});
				});
		};

		loggedin_func();
}]);