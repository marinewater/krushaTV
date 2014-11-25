/**
 * @ngdoc controller
 * @name krushaTV.controllers:loginCtrl
 * @description
 * Controller for login.html template
 * @requires $scope
 * @requires $location
 * @requires krushaTV.service:apiAuth
 * @requires krushaTV.service:notifications
 * @requires krushaTV.service:redirect
 * @requires krushaTV.service:loggedin
 */
krusha.controller('loginCtrl', ['$scope', '$location', 'apiAuth', 'notifications', 'redirect', 'loggedin',
	function($scope, $location, apiAuth, notifications, redirect, loggedin) {
		/**
		 * error messages as infos
		 * @type {Array}
		 */
		$scope.alerts = [];

		/**
		 * @ngdoc loginCtrl.method
		 * @name loginCtrl#loggedin_func
		 * @description checks if a user is logged in and redirects to the homepage if he is
		 * @methodOf krushaTV.controllers:loginCtrl
		 */
		var loggedin_func = function() {
			apiAuth.loginStatus().success(function() {
				$location.path('/');
			});
		};

		/**
		 * @ngdoc loginCtrl.method
		 * @name loginCtrl#closeAlert
		 * @description removes an alert
		 * @methodOf krushaTV.controllers:loginCtrl
		 * @param {number} index index of the alert that should be removed
		 */
		$scope.closeAlert = function(index) {
			$scope.alerts.splice(index, 1);
		};

		/**
		 * @ngdoc loginCtrl.method
		 * @name loginCtrl#login_full
		 * @description logs a user in
		 * @methodOf krushaTV.controllers:loginCtrl
		 * @param {string} username username
		 * @param {string} password password (has to be at least 6 characters long)
		 */
		$scope.login_full = function(username, password) {
			apiAuth.login(username, password)
				.success(function(data) {
					notifications.add('Welcome ' + data.user + '!', 'success', 5000);
					loggedin.setUser(data.user);
					loggedin.setStatus(true);
					redirect.back();
				})
				.error(function(data, code) {
					if (code === 401) {
						$scope.alerts.push({
							'type': 'danger',
							'msg': data.message
						});
					}
				});
		};

		loggedin_func();
}]);