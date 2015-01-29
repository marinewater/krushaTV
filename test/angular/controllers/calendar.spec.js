describe('calendarCtrl', function() {
    beforeEach(module('krushaTV'));

    var $controller;
    var $scope;
    var apiShowFactory;
    var $rootScope;

    beforeEach(inject(function(_$controller_, _$rootScope_, _apiShowFactory_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        apiShowFactory = _apiShowFactory_;

        $controller('calendarCtrl', { $scope: $scope, apiShowFactory: apiShowFactory });
        $scope.$digest();
    }));
    
    it('should set the title', function() {
        expect($scope.$parent.title.length).toBeGreaterThan(0);
    });
    
    it('should retrieve shows (month)', function() {
        spyOn(apiShowFactory.prototype, 'getEpisodesMonth');
        $scope.getShowsMonth(2014, 12);
        expect(apiShowFactory.prototype.getEpisodesMonth).toHaveBeenCalledWith(12, 2014);
    });

    it('should retrieve shows (week)', function() {
        spyOn(apiShowFactory.prototype, 'getEpisodesWeek');
        $scope.getShowsWeek(2014, 12, 31);
        expect(apiShowFactory.prototype.getEpisodesWeek).toHaveBeenCalledWith(31, 12, 2014);
    });

    it('should retrieve shows (day)', function() {
        spyOn(apiShowFactory.prototype, 'getEpisodesDay');
        $scope.getShowsDay(2014, 12, 31);
        expect(apiShowFactory.prototype.getEpisodesDay).toHaveBeenCalledWith(31, 12, 2014);
    });
});