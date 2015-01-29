describe('notificationsCtrl', function() {
    beforeEach(module('krushaTV'));

    var $controller;
    var $scope;
    var notificationsFactory;
    var $rootScope;

    beforeEach(inject(function(_$controller_, _$rootScope_, _notificationsFactory_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        notificationsFactory = _notificationsFactory_;

        $controller('notificationsCtrl', { $scope: $scope, notificationsFactory: notificationsFactory });
    }));
    
    it('should display no notifications', function() {
        $scope.$digest();
        
        expect($scope.notifications.length).toBe(0);
    });

    it('should display a notification', function() {
        var notifications = new notificationsFactory();
        notifications.add('test', 'danger', 20000);
        $scope.$digest();

        expect($scope.notifications.length).toBe(1);
        expect($scope.notifications[0].message).toBe('test');
        expect($scope.notifications[0].class).toBe('danger');
        expect($scope.notifications[0].ttl).toBe(20000);
        expect($scope.notifications[0].close).toBeFalsy();
        expect($scope.notifications[0].link).toBeFalsy();
    });
});