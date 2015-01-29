/**
 * @ngdoc service
 * @name krushaTV.service:searchTextFactory
 * @description stores a user's search query
 */
krusha.service('searchTextFactory', [function () {
    /**
     * search query
     * @type {null|string}
     */
    var search = null;
    
    var searchText = function() {};

    /**
     * @ngdoc searchTextFactory.method
     * @methodOf krushaTV.service:searchTextFactory
     * @name searchTextFactory#getText
     * @description retrieves stored search query
     * @returns {null|string} search query
     */
    searchText.prototype.getText = function () {
        return search
    };

    /**
     * @ngdoc searchTextFactory.method
     * @methodOf krushaTV.service:searchTextFactory
     * @name searchTextFactory#setText
     * @description returns stored search query
     * @param {null|string} value search query
     */
    searchText.prototype.setText = function(value) {
        search = value;
    };

    return searchText;
}]);