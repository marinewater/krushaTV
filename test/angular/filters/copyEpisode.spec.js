describe('copyEpisode', function() {
    beforeEach(module('krushaTV'));

    var $filter;
    beforeEach(inject(function(_$filter_) {
        $filter = _$filter_;
    }));

    it('should return a formated show name with episode', function() {
        var episode = {
            showname: 'Firefly',
            episode: 4,
            season: 1
        };

        expect($filter('copyEpisode')(episode)).toBe('Firefly S01E04');
    });
});