describe('genreLabels', function() {
    beforeEach(module('krushaTV'));

    var $compile;
    var $rootScope;

    beforeEach(inject(function(_$compile_, _$rootScope_){
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should place the appropriate content', function() {
        $rootScope.genre = 'test, test2, test3';
        var element = $compile("<genre-labels genres=\"genre\"></genre-labels>")($rootScope);
        $rootScope.$digest();

        var genre_labels = element.find("span");
        expect(genre_labels.length).toBe(3);

        expect(genre_labels.eq(0).text()).toBe('test');
        expect(genre_labels.eq(1).text()).toBe('test2');
        expect(genre_labels.eq(2).text()).toBe('test3');

        expect(genre_labels.eq(0).attr('class').split(/\s+/)).toContain('label');
        expect(genre_labels.eq(0).attr('class').split(/\s+/)).toContain('label-default');
        expect(genre_labels.eq(1).attr('class').split(/\s+/)).toContain('label');
        expect(genre_labels.eq(1).attr('class').split(/\s+/)).toContain('label-default');
        expect(genre_labels.eq(2).attr('class').split(/\s+/)).toContain('label');
        expect(genre_labels.eq(2).attr('class').split(/\s+/)).toContain('label-default');
    });

    it('should not contain labels', function() {
        $rootScope.genre = '';
        var element = $compile("<genre-labels genres=\"genre\"></genre-labels>")($rootScope);
        $rootScope.$digest();

        var genre_labels = element.find("span");
        expect(genre_labels.length).toBe(0);
    });
});