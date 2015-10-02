/**
 * @ngdoc controller
 * @name krushaTV.controllers:profileCtrl
 * @description
 * Controller for profile.html template
 * @requires $scope
 * @requires $cookieStore
 * @requires krushaTV.service:apiSettingsFactory
 * @requires krushaTV.service:apiImdbFactory
 * @requires krushaTV.service:apiRedditFactory
 * @requires krushaTV.service:notifications
 * @requires krushaTV.service:loggedin
 * @requires hotkeys
 */
krusha.controller('profileCtrl', ['$scope', '$cookieStore', 'apiSettingsFactory', 'apiImdbFactory', 'apiRedditFactory', 'notificationsFactory', 'loggedinFactory', 'hotkeys',
	function($scope, $cookieStore, apiSettingsFactory, apiImdbFactory, apiRedditFactory, notificationsFactory, loggedinFactory, hotkeys) {
		var apiSettings = new apiSettingsFactory();
		var apiImdb = new apiImdbFactory();
		var apiReddit = new apiRedditFactory();
		var notifications = new notificationsFactory();
		var loggedin = new loggedinFactory();
		
		$scope.$parent.title = 'Profile';
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
		 * needed for the success directive: **true:** displays green checkmark, **false:** displays error
		 * @type {{value: (string|boolean)}}
		 */
		$scope.changeDateFormatSuccess = {value: 'not'};

		/**
		 * episode offsets to choose from
		 * @type {Array<number>}
		 */
		$scope.offsets = [];

		/**
		 * date formats
		 * @type {{value: string, display: string}[]}
		 */
		$scope.dateFormats = {
			'yyyy-MM-dd': 'yyyy-MM-dd (2010-31-12)',
			'dd.MM.yyyy': 'dd.MM.yyyy (31.12.2010)',
			'MM/dd/yyyy': 'MM/dd/yyyy (12/31/2010)'
		};

		/**
		 * selected date format
		 * @type {{value: string}}
		 */
		$scope.dateFormat = '';

		/**
		 * display settings
		 * @type {{reddit: boolean, imdb: boolean}}
		 */
		$scope.display = {
			reddit: true,
			imdb: true
		};

		if (typeof $cookieStore.get('display') !== 'undefined') {
			$scope.display = $cookieStore.get('display');
		}

		var hotkey_list = ['h', 'm', 't', 'u', 'w', 'p', 's'];

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
		 * shows without IMDb id
		 * @type {{total_count: number, current_page: number, shows: Array}}
		 */
		$scope.addImdb = {
			total_count: null,
			current_page: 1,
			shows: []
		};

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
				computeOffset($scope.offset);
				$scope.dateFormat = data.settings.date_format;
			});

			getShortcuts();
		};

		var getShortcuts = function() {
			var shortcuts = [];
			for (var idx in hotkey_list) {
				if (hotkey_list.hasOwnProperty(idx)) {
					shortcuts.push(hotkeys.get(hotkey_list[idx]));
				}
			}

			$scope.shortcuts = shortcuts;
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
		$scope.setOffset = function(offset) {
			apiSettings.setEpisodeOffset(parseInt(offset.days), parseInt(offset.hours)).success(function() {
				$scope.setOffsetSuccess.value = true;
			}).error(function() {
				$scope.setOffsetSuccess.value = false;
			});
		};

		var computeOffset = function(offset) {
			if (typeof offset !== 'undefined') {
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
			}
		};

		$scope.$watch('offset', computeOffset, true);

		// IMDB
		/**
		 * @ngdoc profileCtrl.method
		 * @name profileCtrl#getIMDbIds
		 * @description gets all user submitted imdb_ids from the api
		 * @methodOf krushaTV.controllers:profileCtrl
		 */
		$scope.getIMDbIds = function() {
			apiImdb.getSubmittedIMDbIds().success(function(data) {
				$scope.imdb_ids = data.imdb_ids;
			}).error(function(err, code) {
				if (code === 404) {
					$scope.imdb_ids = null;
				}
			});
		};

		/**
		 * @ngdoc profileCtrl.method
		 * @name profileCtrl#getShowsWoImdbId
		 * @description gets all shows without an associated imdb id
		 * @methodOf krushaTV.controllers:profileCtrl
		 */
		$scope.getShowsWoImdbId = function( ) {

			apiImdb.getShowsWithoutIMDbID( ( $scope.addImdb.current_page - 1 ) * 5 ).success( function( data ) {

				$scope.addImdb.shows = data.shows;

				$scope.addImdb.total_count = data.total_count;

			})
				.error( function( error ) {

					console.log( error );

				});

		};

		/**
		 * @ngdoc profileCtrl.method
		 * @name profileCtrl#IMDbSearchLink
		 * @description creates an imdb search link from the show name
		 * @methodOf krushaTV.controllers:profileCtrl
		 * @param {string} show_name search text for imdb
		 * @returns {string} imdb search url
		 */
		$scope.IMDbSearchLink = function( show_name ) {

			return 'http://www.imdb.com/find?ref_=nv_sr_fn&q=' + show_name.trim().replace( /\s/gi, '+' ) + '&s=all';

		};

		$scope.submitIMDbId = function( show_id, imdb_url ) {

			var imdb_id = imdb_url.match( imdb_regex );

			apiImdb.submitIMDbId( imdb_id[1], show_id ).success( function() {

				$scope.getShowsWoImdbId();

			});

		};

		/**
		 * @ngdoc profileCtrl.method
		 * @name profileCtrl#acceptIMDbId
		 * @description accepts a user submission for a imdb id
		 * @methodOf krushaTV.controllers:profileCtrl
		 * @param {number} submission_id unique id for the imdb id that will be accepted
		 */
		$scope.acceptIMDbId = function(submission_id) {
			apiImdb.acceptSubmittedIMDbID(submission_id).success(function() {
				$scope.getIMDbIds();
			}).error(function(err, code) {
				if (code === 409) {
					notifications.add(err.message, 'danger', 5000);
				}
			});
		};

		// reddit
		/**
		 * @ngdoc profileCtrl.method
		 * @name profileCtrl#getSubreddits
		 * @description gets all user submitted subreddits from the api
		 * @methodOf krushaTV.controllers:profileCtrl
		 */
		$scope.getSubreddits = function() {
			apiReddit.getSubmittedSubreddits().success(function(data) {
				$scope.subreddits = data.subreddits;
			}).error(function(err, code) {
				if (code === 404) {
					$scope.subreddits = null;
				}
			});
		};

		/**
		 * @ngdoc profileCtrl.method
		 * @name profileCtrl#acceptSub
		 * @description accepts a user submission for a subreddit
		 * @methodOf krushaTV.controllers:profileCtrl
		 * @param {number} submission_id unique id for the subreddit that will be accepted
		 */
		$scope.acceptSub = function(submission_id) {
			apiReddit.acceptSubmittedSubreddit(submission_id).success(function() {
				$scope.getSubreddits();
			});
		};

		/**
		 * @ngdoc profileCtrl.method
		 * @name profileCtrl#changeDateFormat
		 * @description change date format
		 * @methodOf krushaTV.controllers:profileCtrl
		 * @param {string} date_format date format
		 */
		$scope.changeDateFormat = function(date_format) {
			apiSettings.setDateFormat(date_format).success(function() {
				$scope.changeDateFormatSuccess.value = true;
				loggedin.setDateFormat(date_format);
			});
		};

		$scope.changeDisplaySetting = function(display) {
			$cookieStore.put('display', display);
		};

		getProfile();
}]);