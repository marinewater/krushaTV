/**
 * @ngdoc filter
 * @name krushaTV.filter:orderByName
 * @description "orderByName" sorts an array by name, but does not take a leading "The" into account (e.g. "The Apple" would appear before "Bingo").
 * @param {Array} shows shows
 * @param {string=} attribute Name of the attribute which value should be used for sorting. Defaults to 'name'.
 */
krusha.filter('orderByName', ['$filter', function($filter) {
	var remove_the_regex = /(?:^the )?(.*)/i;
	var save_sort_by = 'name';

	var remove_the = function(show) {
		return show[save_sort_by].match(remove_the_regex)[1];
	};

	return function(shows, sort_by) {
		save_sort_by = (typeof sort_by !== 'undefined') ? sort_by : 'name';

		return $filter('orderBy')(shows, remove_the)
	};
}]);

/**
 * @ngdoc filter
 * @name krushaTV.filter:formatEpisode
 * @description "formatEpisode" creates a string like "S02E03" (stands for Season 2 Episode 3)
 * @param {number} episode episode number
 * @param {number} season season number
 */
krusha.filter('formatEpisode', function() {
	var zeroPadding = function(n) {
		n = parseInt(n);

		if (n < 10) {
			return '0' + n.toString();
		}
		else {
			return n.toString();
		}
	};

	return function(episode, season) {
		episode = zeroPadding(episode);
		season = zeroPadding(season);
		
		return 'S' + season + 'E' + episode;
	};
});

/**
 * @ngdoc filter
 * @name krushaTV.filter:copyEpisode
 * @description "copyEpisode" creates a string that is later used to be copied to the clipboard. Looks like "Firefly S01E04".
 * @param {Object} episode episode
 */
krusha.filter('copyEpisode', ['$filter', function($filter) {
	return function(episode) {
		return episode.showname + ' ' + $filter('formatEpisode')(episode.episode, episode.season);
	}
}]);

/**
 * @ngdoc filter
 * @name krushaTV.filter:countUnwatched
 * @description
 * "countUnwatched" checks if the supplied array contains unwatched episodes if watched episodes should not be displayed.
 * This is used to remove seasons and shows from navigation if they only contain watched episodes and only unawtched episodes should be displayed.
 * @param {Array} show shows
 * @param {Boolean} showWatched determines if watched episodes should be displayed
 */
krusha.filter('countUnwatched', function() {
	var countUnwatched = function(show) {
		return !!show.find(function (season) {
			if (season.episodes.find(function (episode) {
					return episode.watched === false;
				})) {
				return true;
			}
		});

	};
	return function(show, showWatched) {
		return showWatched ? true : countUnwatched(show);
	}
});