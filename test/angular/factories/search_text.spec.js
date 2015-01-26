describe('search_text', function() {

    beforeEach(module('krushaTV'));

    var search_text;

    beforeEach(inject(function(_searchTextFactory_) {
        search_text = new _searchTextFactory_();
    }));

    describe('get set', function() {
        it('should return "test"', function() {
            search_text.setText('test');
            expect(search_text.getText()).toEqual('test');
        });

        it('should return null', function() {
            expect(search_text.getText()).toEqual(null);
        });
    });
});