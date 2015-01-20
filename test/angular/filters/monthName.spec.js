describe('copyEpisode', function() {
    beforeEach(module('krushaTV'));

    var $filter;
    beforeEach(inject(function(_$filter_) {
        $filter = _$filter_;
    }));

    it('should return null for null', function() {
        expect($filter('monthName')(0)).toBeNull();
    });

    it('should return null for negative integer', function() {
        expect($filter('monthName')(-1)).toBeNull();
    });

    it('should return null for integer > 12', function() {
        expect($filter('monthName')(13)).toBeNull();
    });

    it('should return January', function() {
        expect($filter('monthName')(1)).toBe('January');
    });

    it('should return February', function() {
        expect($filter('monthName')(2)).toBe('February');
    });

    it('should return December', function() {
        expect($filter('monthName')(12)).toBe('December');
    });
});