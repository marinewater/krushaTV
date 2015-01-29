describe('unwatched', function() {
    beforeEach(module('krushaTV'));
    beforeEach(module('templates'));

    var $compile;
    var $rootScope;
    var element;

    var tpl = '<unwatched shows="shows" ' +
        'seasons="seasons" ' +
        'episodes="episodes" ' +
        'get-seasons="getWatchedSeasons" ' +
        'get-episodes="getWatchedEpisodes" ' +
        'mark-episode-watched="markEpisodeUnwatched" ' +
        'mark-season-watched="markSeasonNotWatched" ' +
        'mark-show-watched="markShowNotWatched" ' +
        'watched="watched"></unwatched>';

    var episodes = [
        { episode: 2, title: 'test', airdate: new Date('2013-08-03T00:00:00Z') },
        { episode: 4, title: 'more test', airdate: new Date('1985-10-01T00:00:00Z') },
        { episode: 1, title: 'super test', airdate: new Date('2015-12-31T00:00:00Z') },
        { episode: 3, title: 'test test', airdate: new Date('2010-10-10T00:00:00Z') }
    ];

    var seasons = [
        { season: 2, active: false },
        { season: 4, active: false },
        { season: 6, active: false },
        { season: 1, active: false },
        { season: 5, active: false },
        { season: 3, active: true }
    ];

    var shows = [
        { id: 1, name: 'test', active: true },
        { id: 12, name: 'lalala', active: false },
        { id: 122, name: 'abc', active: false },
        { id: 127, name: 'def', active: false },
        { id: 182, name: 'geh', active: false }
    ];

    beforeEach(inject(function(_$compile_, _$rootScope_){
        $compile = _$compile_;
        $rootScope = _$rootScope_;

        element = $compile(tpl)($rootScope);
    }));
    
    it('should display an erro message', function() {
        $rootScope.watched = false;
        $rootScope.shows = [];
        $rootScope.seasons = [];
        $rootScope.episodes = [];
        $rootScope.$digest();
        
        expect(element.find('.card').length).toBe(1);
        expect(element.find('p').text()).toContain('no');
    });

    it('should display "Unwatched Episodes"', function() {
        $rootScope.watched = false;
        $rootScope.shows = shows;
        $rootScope.seasons = seasons;
        $rootScope.episodes = episodes;
        $rootScope.$digest();

        expect(element.find('.page-header:first > h1').text()).toBe('Unwatched Episodes');
        expect(element.find('table:first th.hidden-xs:first').text()).toBe('Watched');
        expect(element.find('table:first th.visible-xs:first').text()).toBe('W.');
    });

    it('should display "Watched Episodes"', function() {
        $rootScope.watched = true;
        $rootScope.shows = shows;
        $rootScope.seasons = seasons;
        $rootScope.episodes = episodes;
        $rootScope.$digest();

        expect(element.find('.page-header:first > h1').text()).toBe('Watched Episodes');
        expect(element.find('table:first th.hidden-xs:first').text()).toBe('Unwatched');
        expect(element.find('table:first th.visible-xs:first').text()).toBe('Unw.');
    });

    it('should display shows', function() {
        $rootScope.shows = shows;
        $rootScope.seasons = seasons;
        $rootScope.episodes = episodes;

        $rootScope.$digest();

        var show_elements = element.find('#shows li');

        expect(show_elements.length).toBe(5);

        expect(show_elements.eq(0).text()).toBe('abc');
        expect(show_elements.eq(0).hasClass('active')).toBeFalsy();

        expect(show_elements.eq(4).text()).toBe('test');
        expect(show_elements.eq(4).hasClass('active')).toBeTruthy();

        expect(element.find('#episodes h2:first').text()).toContain('test');
    });

    it('should display seasons', function() {
        $rootScope.shows = shows;
        $rootScope.seasons = seasons;
        $rootScope.episodes = episodes;
        $rootScope.$digest();

        var seasons_elements = element.find('#seasons li');
        expect(seasons_elements.length).toBe(6);

        expect(seasons_elements.eq(0).text()).toBe('Season 1');
        expect(seasons_elements.eq(0).hasClass('active')).toBeFalsy();

        expect(seasons_elements.eq(2).text()).toBe('Season 3');
        expect(seasons_elements.eq(2).hasClass('active')).toBeTruthy();

        expect(element.find('#episodes h2:first').text()).toContain('Season 3');
    });

    it('should display episodes', function() {
        $rootScope.watched = false;
        $rootScope.episodes = episodes;
        $rootScope.$digest();

        var episode_elements = element.find('#episodes table:first tbody:first tr');

        expect(episode_elements.length).toBe(4);

        var first_episode = episode_elements.eq(0).find('td');

        expect(first_episode.eq(0).text()).toBe('1');
        expect(first_episode.eq(1).text()).toBe('super test');
        expect(first_episode.eq(2).text()).toBe('2015-12-31');
        expect(first_episode.eq(3).find('span').hasClass('fa-times')).toBeTruthy();
        expect(first_episode.eq(3).find('span').hasClass('text-danger')).toBeTruthy();
    });

    it('should not show the links', function() {
        $rootScope.seasons = [1];
        $rootScope.episodes = [1];
        $rootScope.$digest();

        expect(element.find('#episodes .mark-watched').length).toBe(0);
    });

    it('should show the season link', function() {
        $rootScope.shows = shows;
        $rootScope.seasons = seasons;
        $rootScope.episodes = [{ episode: 2, title: 'test', airdate: new Date('2013-08-03T00:00:00Z') }];
        $rootScope.watched = false;
        $rootScope.$digest();

        var mark_watched = element.find('#episodes .mark-watched');
        expect(mark_watched.length).toBe(1);
        expect(mark_watched.find('p').length).toBe(1);
        expect(mark_watched.find('hr').length).toBe(0);

        var mark_watched_text = mark_watched.find('p').text();
        expect(mark_watched_text).toContain('test');
        expect(mark_watched_text).toContain(' watched');
    });

    it('should show the episode link', function() {
        $rootScope.shows = shows;
        $rootScope.seasons = [{ season: 6, active: true }];
        $rootScope.episodes = episodes;
        $rootScope.watched = true;
        $rootScope.$digest();

        var mark_watched = element.find('#episodes .mark-watched');
        expect(mark_watched.length).toBe(1);
        expect(mark_watched.find('p').length).toBe(1);
        expect(mark_watched.find('hr').length).toBe(0);

        var mark_watched_text = mark_watched.find('p').text();
        expect(mark_watched_text).toContain('test');
        expect(mark_watched_text).toContain(' unwatched');
        expect(mark_watched_text).toContain('Season 6');
    });

    it('should show both links', function() {
        $rootScope.shows = shows;
        $rootScope.seasons = seasons;
        $rootScope.episodes = episodes;
        $rootScope.$digest();

        var mark_watched = element.find('#episodes .mark-watched');
        expect(mark_watched.length).toBe(1);
        expect(mark_watched.find('p').length).toBe(2);
        expect(mark_watched.find('hr').length).toBe(1);
    });
});