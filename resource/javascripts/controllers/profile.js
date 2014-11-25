/**
 * @ngdoc controller
 * @name krushaTV.controllers:profileCtrl
 * @description
 * Controller for profile.html template
 * @requires $scope
 * @requires krushaTV.service:apiSettings
 */
krusha.controller('profileCtrl', ['$scope', 'apiSettings', function($scope, apiSettings) {
	/**
	 * username
	 * @type {string}
	 */
	$scope.username = null;
	/**
	 * total amount of shows the user is tracking
	 * @type {number}
	 */
	$scope.total_shows = null;
	/**
	 * total amount of episodes the user has watched
	 * @type {number}
	 */
	$scope.total_episodes = null;
	/**
	 * **true:** user is admin
	 * @type {boolean}
	 */
	$scope.admin = false;

	/**
	 * needed for the success directive: **true:** displays green checkmark, **false:** displays error
	 * @type {{value: (string|boolean)}}
	 */
	$scope.setOffsetSuccess = {value: 'not'};

	/**
	 * episode offsets to choose from
	 * @type {Array<number>}
	 */
	$scope.offsets = [];

	/**
	 * date formats
	 * @type {{value: string, display: string}[]}
	 */
	$scope.dateFormats = [
		{ value: 'yyyy-MM-dd', display: 'yyyy-MM-dd (2010-31-12)'},
		{ value: 'dd.MM.yyyy', display: 'dd.MM.yyyy (31.12.2010)'},
		{ value: 'MM/dd/yyyy', display: 'MM/dd/yyyy (12/31/2010)'}
	];

	var now = new Date();
	now.setHours(0);
	now.setMinutes(0);
	now.setSeconds(0);
	now.setMilliseconds(0);
	/**
	 * todays date
	 * @type {number}
	 */
	$scope.now = now;

	/**
	 * @ngdoc profileCtrl.method
	 * @name profileCtrl#getProfile
	 * @description gets the user profile from the api
	 * @methodOf krushaTV.controllers:profileCtrl
	 */
	var getProfile = function() {
		apiSettings.getProfile().success(function(data) {
			$scope.username = data.user;
			$scope.total_shows = data.total_shows;
			$scope.total_episodes = data.total_episodes;
			$scope.admin = data.admin;
			$scope.offset = data.settings.episode_offset;
			$scope.computeOffset($scope.offset);
		});
	};

	/**
	 * @ngdoc profileCtrl.method
	 * @name profileCtrl#setOffset
	 * @methodOf krushaTV.controllers:profileCtrl
	 * @description
	 * is called when the user changes the offset select and sends the offset to the api
	 * displays a checkmark if the change was successful or error if the request failed
	 * @param {number} offset episode offset in days
	 */
	$scope.setOffset = function(days, hours) {
		apiSettings.setEpisodeOffset(parseInt(days), parseInt(hours)).success(function() {
			$scope.setOffsetSuccess.value = true;
		}).error(function() {
			$scope.setOffsetSuccess.value = false;
		});
	};

	$scope.computeOffset = function(offset) {
		var total_hours = offset.days*24 + offset.hours;

		var hours = total_hours % 24;
		var days = (total_hours - hours) / 24;

		$scope.days = days;
		$scope.hours = hours;

		var dateDisplayed = new Date();
		dateDisplayed.setHours(0);
		dateDisplayed.setMinutes(0);
		dateDisplayed.setSeconds(0);
		dateDisplayed.setMilliseconds(0);
		dateDisplayed.setDate($scope.now.getDate() + days);
		dateDisplayed.setHours($scope.now.getHours() + hours);
		$scope.dateDisplayed = dateDisplayed;
	};

	getProfile();
}]);