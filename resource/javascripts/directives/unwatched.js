/**
 * @ngdoc directive
 * @name krushaTV.directive:unwatched
 * @description displays all watched/unwatched episodes and lets the user mark them as unwatched/watched
 * @restrict E
 * @scope
 * @param {object} shows object containing shows with watched/unwatched episodes
 * @param {object} seasons object containing seasons with watched/unwatched episodes
 * @param {object} episodes object containing watched/unwatched episodes
 * @param {function} getSeasons function that receives all seasons for a specified show
 * @param {function} getEpisodes function that receives all episodes for a specified season
 * @param {function} markShowWatched function that marks all episodes of a show as watchted/unwatched
 * @param {function} markSeasonWatched function that marks all episodes of a season as watchted/unwatched
 * @param {function} markEpisodeWatched function that marks a single episode as watchted/unwatched
 * @param {boolean} watched determined if this template shows watched or unwatched episodes
 */
krusha.directive('unwatched', ['$timeout', 'loggedin', function($timeout, loggedin) {
    var link = function($scope) {
        if (typeof $scope.shows === 'undefined')
            $scope.shows = [];
        if (typeof $scope.seasons === 'undefined')
            $scope.seasons = [];

        $scope.dateFormat = loggedin.getDateFormat();

        $scope.getActiveShow = function() {
            return $scope.shows.find(function(show) {
                return !!show.active;
            });
        };

        $scope.scrollShows = function() {
            $(document.body).animate({
                'scrollTop':   $('#shows').offset().top - 70
            }, 200);
        };

        $scope.getActiveSeason = function() {
            return $scope.seasons.find(function(season) {
                return !!season.active;
            });
        };

        $scope.getSeasonsScroll = function(show_id) {
            $scope.getSeasons(show_id);
            $(document.body).animate({
                'scrollTop':   $('#seasons').offset().top - 70
            }, 200);
        };

        $scope.getEpisodesScroll = function(show_id, season) {
            $scope.getEpisodes(show_id, season);
            $(document.body).animate({
                'scrollTop':   $('#episodes').offset().top - 70
            }, 200);
        };

        $scope.watched_text = $scope.watched ? 'unwatched' : 'watched';
        $scope.watched_text_cap = $scope.watched ? 'Unwatched' : 'Watched';
        $scope.watched_text_cap_short = $scope.watched ? 'Unw.' : 'W.';
    };

    return {
        restrict: 'E',
        templateUrl: '/static/templates/directives/unwatched.html',
        link: link,
        scope: {
            shows: '=shows',
            seasons: '=seasons',
            episodes: '=episodes',
            getSeasons: '=getSeasons',
            getEpisodes: '=getEpisodes',
            markEpisodeWatched: '=markEpisodeWatched',
            markSeasonWatched: '=markSeasonWatched',
            markShowWatched: '=markShowWatched',
            watched: '=watched'
        }
    }
}]);