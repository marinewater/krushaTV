/**
 * @ngdoc controller
 * @name krushaTV.controllers:trackCtrl
 * @description
 * Controller for track.html
 * shows shows the user is tracking and some additional information
 * @requires $scope
 * @requires krushaTV.service:apiShowFactory
 * @requires krushaTV.service:notificationsFactory
 */
krusha.controller('trackCtrl', ['$scope', 'apiShowFactory', 'notificationsFactory', function($scope, apiShowFactory, notificationsFactory) {
	var apiShow = new apiShowFactory();
	var notifications = new notificationsFactory();
	
	$scope.$parent.title = 'Tracked Shows';

	/**
	 * @ngdoc trackCtrl.method
	 * @name trackCtrl#getTracked
	 * @description retrieves a user's tracked shows from the api
	 * @methodOf krushaTV.controllers:trackCtrl
	 */
	var getTracked = function() {
		apiShow.getTracked()
			.success(function(data) {
				$scope.shows = data.shows;
			})
			.error(function(err, status) {
				if (status === 404) {
					$scope.shows = null;
				}
			});
	};

	/**
	 * @ngdoc trackCtrl.method
	 * @name trackCtrl#doTrack
	 * @description readd a show to tracked shows
	 * @methodOf krushaTV.controllers:trackCtrl
	 * @param {object} show show object
	 */
	var doTrack = function(show) {
		apiShow.addTracked(show.id).success(function() {
			getTracked();
			notifications.add('You are now tracking ' + show.name + ' again.', 'success', 10000, true);
		});
	};

	/**
	 * @ngdoc trackCtrl.method
	 * @name trackCtrl#doNotTrack
	 * @description remove a show from tracked shows
	 * @methodOf krushaTV.controllers:trackCtrl
	 * @param {object} show show object
	 */
	$scope.doNotTrack = function(show) {
		apiShow.deleteTracked(show.id).success(function() {
			$scope.shows.splice($scope.shows.indexOf(show), 1);

			var undo = {
				link_function: function() {
					doTrack(show);
				},
				text: 'Undo'
			};

			notifications.add('Removed ' + show.name + ' from tracked shows.', 'danger', 10000, true, undo);
		});
	};

	/**
	 * @ngdoc trackCtrl.method
	 * @name trackCtrl#orderByName
	 * @description
	 * removes a leading "the" from a show name for sorting, e.g. "The Amazing Race" would appear before "Firefly"
	 * @methodOf krushaTV.controllers:trackCtrl
	 * @param {object} show show object
	 */
	$scope.orderByName = function(show) {
		var remove_the_regex = /(?:^the )?(.*)/i;

		return show.name.match(remove_the_regex)[1];
	};

	getTracked();
}]);