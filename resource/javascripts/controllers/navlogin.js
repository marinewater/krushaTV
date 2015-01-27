/**
 * @ngdoc controller
 * @name krushaTV.controllers:navLoginCtrl
 * @description
 * Controller for navbar login
 * @requires $scope
 * @requires $location
 * @requires $modal
 * @requires krushaTV.service:redirectFactory
 * @requires krushaTV.service:apiAuthFactory
 * @requires krushaTV.service:loggedinFactory
 * @requires krushaTV.service:notificationsFactory
 */
krusha.controller('navLoginCtrl', ['$scope', '$location', '$modal', 'redirectFactory', 'apiAuthFactory', 'loggedinFactory', 'notificationsFactory',
	function($scope, $location, $modal, redirectFactory, apiAuthFactory, loggedinFactory, notificationsFactory) {
		var redirect = new redirectFactory();
		var apiAuth = new apiAuthFactory();
		var loggedin = new loggedinFactory();
		var notifications = new notificationsFactory();
		
		/**
		 * **true:** user is logged in, **false:** user is *not* logged in
		 * @type {boolean}
		 */
		$scope.loggedin = false;
		/**
		 * user information
		 * @type {{name: null, id: null}}
		 */
		$scope.user = {
			name: null,
			id: null
		};

		/**
		 * @ngdoc navLoginCtrl.method
		 * @name navLoginCtrl#init
		 * @description
		 * checks if the user is logged in and displays the user's name and and a logout button if he is, a login and a signup button if he is not
		 * @methodOf krushaTV.controllers:navLoginCtrl
		 */
		var init = function() {
			apiAuth.loginStatus()
				.success(function(data) {
					loggedin.setUser(data.user);
					loggedin.setDateFormat(data.dateFormat);
					loggedin.setStatus(true);
				}).error(function(err, status) {
					if (status == 401) {
						loggedin.setStatus(false);
					}
				});
		};

		/**
		 * @ngdoc navLoginCtrl.method
		 * @name navLoginCtrl#loginButton
		 * @description
		 * redirects the user to the login page
		 * @methodOf krushaTV.controllers:navLoginCtrl
		 */
		$scope.loginButton = function() {
			redirect.login();
		};

		$scope.$on('loggedin', function() {
			$scope.loggedin = loggedin.getStatus();
			$scope.user.name = loggedin.getUser();
		});

		/**
		 * @ngdoc navLoginCtrl.method
		 * @name navLoginCtrl#open
		 * @description
		 * opens a modal with the login form
		 * @methodOf krushaTV.controllers:navLoginCtrl
		 */
		$scope.open = function () {
			$modal.open({
				templateUrl: 'static/templates/loginmodal.html',
				size: 'lg',
				controller: 'ModalInstanceCtrl'
			});
		};

		/**
		 * @ngdoc navLoginCtrl.method
		 * @name navLoginCtrl#logout
		 * @description
		 * logs the user out and redirects him to the homepage
		 * @methodOf krushaTV.controllers:navLoginCtrl
		 */
		$scope.logout = function() {
			apiAuth.logout()
				.success(function() {
					notifications.add('Logout successful!', 'warning', 5000);
					loggedin.setStatus(false);
					loggedin.setDateFormat(false);
					$location.path('/');
				})
				.error(function() {
					notifications.add('Logout failed!', 'danger', 5000);
				});
		};

		init();
}]);

/**
 * @ngdoc controller
 * @name krushaTV.controllers:ModalInstanceCtrl
 * @description
 * Controller for login modal
 * @requires $scope
 * @requires $modalInstance
 * @requires krushaTV.service:apiAuth
 * @requires krushaTV.service:notifications
 * @requires krushaTV.service:loggedin
 */
krusha.controller('ModalInstanceCtrl', ['$scope', '$modalInstance', 'apiAuthFactory', 'notificationsFactory', 'loggedinFactory',
	function ($scope, $modalInstance, apiAuthFactory, notificationsFactory, loggedinFactory) {
		var apiAuth = new apiAuthFactory();
		var loggedin = new loggedinFactory();
		var notifications = new notificationsFactory();
		
		/**
		 * error messages as infos
		 * @type {Array}
		 */
		$scope.alerts = [];

		/**
		 * defines if a user is logged out after the session or keeps being logged in
		 * false: cookie expires after the session ends
		 * true: user keeps being logged in
		 * @type {boolean}
		 */
		$scope.keep_logged_in = false;

		/**
		 * @ngdoc ModalInstanceCtrl.method
		 * @name ModalInstanceCtrl#cancel
		 * @description
		 * closes the modal
		 * @methodOf krushaTV.controllers:ModalInstanceCtrl
		 */
		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

		/**
		 * @ngdoc ModalInstanceCtrl.method
		 * @name ModalInstanceCtrl#login
		 * @description
		 * logs the user in
		 * @methodOf krushaTV.controllers:ModalInstanceCtrl
		 * @param {string} username username
		 * @param {string} password password (has to be at least 6 characters long)
		 */
		$scope.login = function(username, password, keep_logged_in) {
			apiAuth.login(username, password, keep_logged_in)
				.success(function(data) {
					notifications.add('Welcome ' + data.user + '!', 'success', 5000);
					loggedin.setUser(data.user);
					loggedin.setDateFormat(data.dateFormat);
					loggedin.setStatus(true);
					$scope.cancel();
				})
				.error(function(data, code) {
					if (code === 401) {
						addAlert(data.message, 'danger');
					}
				});
		};

		/**
		 * @ngdoc ModalInstanceCtrl.method
		 * @name ModalInstanceCtrl#addAlert
		 * @description
		 * displays an error message
		 * @methodOf krushaTV.controllers:ModalInstanceCtrl
		 * @param {string} msg message
		 * @param {string} type type of error (danger, success, warning, info)
		 */
		var addAlert = function(msg, type) {
			$scope.alerts.push({ 'type': type, 'msg': msg });
		};

		/**
		 * @ngdoc ModalInstanceCtrl.method
		 * @name ModalInstanceCtrl#closeAlert
		 * @description
		 * closes an error message
		 * @methodOf krushaTV.controllers:ModalInstanceCtrl
		 * @param {number} index index of the alert that should be removed
		 */
		$scope.closeAlert = function(index) {
			$scope.alerts.splice(index, 1);
		};
}]);