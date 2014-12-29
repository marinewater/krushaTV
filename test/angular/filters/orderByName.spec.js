describe('orderByName', function() {
    beforeEach(module('krushaTV'));

    var $filter;

    beforeEach(inject(function(_$filter_) {
        $filter = _$filter_;
    }));

    it('should sort a list of shows by \'name\' attribute', function() {
        var shows = [
            {'name': 'The Walking Dead'},
            {'name': 'Chuck'},
            {'name': 'The Big Bang Theory'},
            {'name': 'Firefly'}
        ];

        var shows_sorted = $filter('orderByName')(shows);

        expect(shows_sorted[0].name).toEqual('The Big Bang Theory');
        expect(shows_sorted[1].name).toEqual('Chuck');
        expect(shows_sorted[2].name).toEqual('Firefly');
        expect(shows_sorted[3].name).toEqual('The Walking Dead');
    });

    it('should sort a list of shows by \'attr\' attribute', function() {
        var shows = [
            {'attr': 'The Walking Dead'},
            {'attr': 'Chuck'},
            {'attr': 'The Big Bang Theory'},
            {'attr': 'Firefly'}
        ];

        var shows_sorted = $filter('orderByName')(shows, 'attr');

        expect(shows_sorted[0].attr).toEqual('The Big Bang Theory');
        expect(shows_sorted[1].attr).toEqual('Chuck');
        expect(shows_sorted[2].attr).toEqual('Firefly');
        expect(shows_sorted[3].attr).toEqual('The Walking Dead');
    });
});