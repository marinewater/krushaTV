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

krusha.filter('copyEpisode', ['$filter', function($filter) {
	return function(episode) {
		return episode.showname + ' ' + $filter('formatEpisode')(episode.episode, episode.season);
	}
}]);

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