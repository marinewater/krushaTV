describe('formatEpisode', function() {
    beforeEach(module('krushaTV'));

    var $filter;

    beforeEach(inject(function (_$filter_) {
        $filter = _$filter_;
    }));

    it('should return a formatted episode number', function() {
        expect($filter('formatEpisode')(12, 23)).toBe('S23E12');
    });

    it('should return a zero padded episode number', function() {
        expect($filter('formatEpisode')(7, 3)).toBe('S03E07');
    });

    it('numbers >99 should work', function() {
        expect($filter('formatEpisode')(123, 456)).toBe('S456E123');
    });

    it('NaN should be converted to zero', function() {
        expect($filter('formatEpisode')(123)).toBe('S00E123');
    });
});