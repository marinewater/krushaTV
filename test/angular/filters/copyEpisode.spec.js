describe('copyEpisode', function() {
    beforeEach(module('krushaTV'));

    var $filter;
    beforeEach(inject(function(_$filter_) {
        $filter = _$filter_;
    }));

    it('should return a formatted show name with episode', function() {
        var episode = {
            showname: 'Firefly',
            episode: 4,
            season: 1
        };

        expect($filter('copyEpisode')(episode)).toBe('Firefly S01E04');
    });

    it('should return a formatted show name with episode if a show name is provided', function() {
        var episode = {
            episode: 3,
            season: 2
        };

        var showname = 'Sherlock';

        expect($filter('copyEpisode')(episode, showname)).toBe('Sherlock S02E03');
    });

    it('should return a formatted show name with episode if a season is provided', function() {
        var episode = {
            episode: 2,
            showname: 'Sherlock'
        };

        var season = 3;

        expect($filter('copyEpisode')(episode, undefined, season)).toBe('Sherlock S03E02');
    });
});