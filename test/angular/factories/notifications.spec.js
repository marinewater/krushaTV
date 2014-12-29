describe('search_text', function() {

    beforeEach(module('krushaTV'));

    var notifications;

    beforeEach(inject(function(_notifications_) {
        notifications = _notifications_;
    }));

    describe('add', function() {
        it('should broadcast a notification event', inject(function($rootScope) {
            spyOn($rootScope, '$broadcast');
            notifications.add('test', 'success', 5000);
            expect($rootScope.$broadcast).toHaveBeenCalledWith('notification');
        }));
    });

    describe('pop', function() {
        var $rootScope;

        beforeEach(inject(function(_$rootScope_) {
            $rootScope = _$rootScope_;
        }));

        it('should return no notifications', function() {
            var ntfcts = notifications.pop();
            expect(ntfcts).toEqual(jasmine.any(Object));
            expect(ntfcts.length).toEqual(0);
        });

        it('should return notifications without close button or link', function() {
            notifications.add('test notification', 'success', 1234);
            notifications.add('test notification 2', 'danger', 1337);
            var ntfcts = notifications.pop();

            expect(ntfcts).toEqual(jasmine.any(Object));
            expect(ntfcts.length).toEqual(2);
            expect(ntfcts[0]).toEqual({
                'message': 'test notification',
                'class': 'success',
                'ttl': 1234,
                'close': false,
                'link': false
            });

            var ntfcts2 = notifications.pop();
            expect(ntfcts2).toEqual(jasmine.any(Object));
            expect(ntfcts2.length).toEqual(0);
        });

        it('should return a notification with close button and link', function() {
            var link = {
                'link_function': function() { console.log(true); },
                'text': 'test link'
            };

            notifications.add('test notification', 'success', 1234, true, link);
            var ntfcts = notifications.pop();

            expect(ntfcts).toEqual(jasmine.any(Object));
            expect(ntfcts.length).toEqual(1);
            expect(ntfcts[0]).toEqual({
                'message': 'test notification',
                'class': 'success',
                'ttl': 1234,
                'close': true,
                'link': link
            });
        });
    });
});