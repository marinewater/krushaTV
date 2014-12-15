/**
 * @ngdoc controller
 * @name krushaTV.controllers:mainCtrl
 * @description
 * Controller in main template, is always loaded
 * @requires $scope
 * @requires $rootScope
 * @requires $location
 * @requires krushaTV.service:search_text
 */
krusha.controller('mainCtrl', ['$scope', '$rootScope', '$location', 'search_text', function($scope, $rootScope, $location, search_text) {
	/**
	 * @ngdoc mainCtrl.method
	 * @name mainCtrl#getResults
	 * @description changes location to display search results and broadcasts that the search query has changed
	 * @methodOf krushaTV.controllers:mainCtrl
	 * @param {string} search_input search text, e.g. *Firefly*
	 */
	$scope.getResults = function(search_input) {
		search_text.setText(search_input);
		if ($location.path() !== '/search') {
			$location.path('/search');
		}
		else {
			$rootScope.$broadcast('search_input');
		}
	};
}]);

/**
 * @ngdoc controller
 * @name krushaTV.controllers:searchCtrl
 * @description Controller for search.html template
 * @requires $scope
 * @requires $location
 * @requires $rootScope
 * @requires krushaTV.service:apiSearch
 * @requires krushaTV.service:search_text
 */
krusha.controller('searchCtrl', ['$scope', '$location', '$rootScope', 'apiSearch', 'apiShow', 'search_text',
	function($scope, $location, $rootScope, apiSearch, apiShow, search_text) {
		$scope.$parent.title = 'Search Results';
	$scope.shows= [];
	$scope.shows_remote = [];

	/**
	 * @ngdoc searchCtrl.method
	 * @name searchCtrl#getResults
	 * @description fetches search results from two api endpoints (local database and remote api)
	 * @methodOf krushaTV.controllers:searchCtrl
	 */
	var getResults = function() {
		/**
		 * search text for show to use in search
		 * @type {string}
		 */
		var search_query = search_text.getText();

		if (search_query !== null && search_query.length >= 2) {
			$scope.shows = [];
			$scope.shows_remote = [];

			apiSearch.searchLocal(search_query).then(function(data) {
				$scope.shows = data.data.shows;
			}, function() {
				$scope.shows = [];
			});
			apiSearch.searchRemote(search_query).then(function(data) {
				$scope.shows_remote = data.data.shows;
			}, function() {
				$scope.shows_remote = [];
			});
		}
	};

	/**
	 * @ngdoc searchCtrl.method
	 * @name searchCtrl#compileSearch
	 * @description
	 * takes the results of the local and the remote search and combines them into one array
	 * if there is an entry in both result sets, only the local one will be put into the result array
	 * @methodOf krushaTV.controllers:searchCtrl
	 */
	var compileSearch = function() {
		var result = $scope.shows;

		$scope.shows_remote.forEach(function(show) {
			/**
			 * false: show is not in local database, true: show is in local database
			 * @type {boolean}
			 */
			var show_in_db = false;

			for (var i in result) {
				if (result.hasOwnProperty(i)) {
					if (result[i].showid === show.showid) {
						show_in_db = true;
						break;
					}
				}
			}

			if (!show_in_db) {
				result.push(show);
			}
		});

		$scope.result = result;
	};

	$scope.$watch('shows', compileSearch);
	$scope.$watch('shows_remote', compileSearch);

	/**
	 * @ngdoc searchCtrl.method
	 * @name searchCtrl#mobileSearch
	 * @description
	 * mobile search is not in the navbar, instead it is above the search results
	 * since the search function is only listening for the rootscope broadcast, we have to broadcast here
	 * @methodOf krushaTV.controllers:searchCtrl
	 * @param {string} search_input search text, e.g. *Firefly*
	 */
	$scope.mobileSearch = function(search_input) {
		search_text.setText(search_input);
		$rootScope.$broadcast('search_input');
	};

	/**
	 * @ngdoc searchCtrl.method
	 * @name searchCtrl#getShow
	 * @description
	 * change location to the show, create it first if it is not in the database
	 * @methodOf krushaTV.controllers:searchCtrl
	 * @param {object} show show
	 * @param {string} show.location *local* or *remote*
	 * @param {number} show.id show id
	 */
	$scope.getShow = function(show) {
		if (show.location === 'local') {
			$location.path('/show/' + show.id);
		}
		else {
			apiShow.addShow(show.showid).success(function(data) {
				$location.path('/show/' + data.id);
			});
		}
	};

	// the search field is in a different controller, we have to listen if a change is broadcasted
	$scope.$on('search_input', function() {
		getResults();
	});

	getResults();
}]);