/**
 * @ngdoc controller
 * @name krushaTV.controllers:signupCtrl
 * @description
 * Controller for signup.html template
 * @requires $scope
 * @requires $location
 * @requires krushaTV.service:apiAuthFactory
 * @requires krushaTV.service:notificationsFactory
 * @requires krushaTV.service:loggedinFactory
 */
krusha.controller('signupCtrl', ['$scope', '$location', 'apiAuthFactory', 'notificationsFactory', 'loggedinFactory',
	function($scope, $location, apiAuthFactory, notificationsFactory, loggedinFactory) {
		var apiAuth = new apiAuthFactory();
		var notifications = new notificationsFactory();
		var loggedin = new loggedinFactory();
		
		$scope.$parent.title = 'Sign Up';

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
			var captcha = grecaptcha.getResponse();

			if (captcha === '') {
				$scope.alerts.push({
					'type': 'danger',
					'msg': 'You need to complete the captcha.'
				});
			}
			else {
				apiAuth.signup(username, password, captcha)
					.success(function(data) {
						loggedin.setUser(data.user);
						loggedin.setStatus(true);
						notifications.add('Welcome ' + data.user + '!', 'success', 5000);
						$location.path("/");
					})
					.error(function(err) {
						grecaptcha.reset();
						$scope.alerts.push({
							'type': 'danger',
							'msg': err.message
						});
					});
			}
		};

		loggedin_func();
}]);