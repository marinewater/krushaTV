/**
 * @ngdoc service
 * @name krushaTV.service:notificationsFactory
 * @description displays notifications
 * @requires $rootScope
 */
krusha.factory('notificationsFactory', ['$rootScope', function($rootScope) {
    var notifications = [];
    
    var notificationsClass = function() {};

    /**
     * @ngdoc notificationsFactory.method
     * @methodOf krushaTV.service:notificationsFactory
     * @name notificationsFactory#add
     * @description displays a notification
     * @param {String} message message that will be displayed in the notification
     * @param {String} bg_class can be success, warning, danger or info, determines the background color
     * @param {Number} ttl time in milliseconds the notification will be displayed
     * @param {Boolean=} close option to display a link to close the notification
     * @param {object=} link custom link to add to the notification
     */
    notificationsClass.prototype.add = function(message, bg_class, ttl, close, link) {
        if (typeof close === 'undefined') {
            close = false;
        }
        if (typeof link === 'undefined') {
            link = false;
        }

        notifications.push({
            'message': message,
            'class': bg_class,
            'ttl': ttl,
            'close': close,
            'link': link
        });

        $rootScope.$broadcast('notification');
    };

    /**
     * @ngdoc notificationsFactory.method
     * @methodOf krushaTV.service:notificationsFactory
     * @name notificationsFactory#pop
     * @description removes and returns notifications
     * @returns {Array} notifications
     */
    notificationsClass.prototype.pop = function() {
        var note_temp = notifications;
        notifications = [];
        return note_temp;
    };

    return notificationsClass;
}]);