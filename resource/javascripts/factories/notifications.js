/**
 * @ngdoc service
 * @name krushaTV.service:notifications
 * @description displays notifications
 * @requires $rootScope
 */
krusha.factory('notifications', ['$rootScope', function($rootScope) {
    var notifications = [];

    return {
        /**
         * @ngdoc notifications.method
         * @methodOf krushaTV.service:notifications
         * @name notifications#add
         * @description displays a notification
         * @param {String} message message that will be displayed in the notification
         * @param {String} bg_class can be success, warning, danger or info, determines the background color
         * @param {Number} ttl time in milliseconds the notification will be displayed
         */
        add: function(message, bg_class, ttl) {
            notifications.push({
                'message': message,
                'class': bg_class,
                'ttl': ttl
            });

            $rootScope.$broadcast('notification', true);
        },

        /**
         * @ngdoc notifications.method
         * @methodOf krushaTV.service:notifications
         * @name notifications#pop
         * @description removes and return notifications
         * @returns {Array} notifications
         */
        pop: function() {
            var note_temp = notifications;
            notifications = [];
            return note_temp;
        }
    }
}]);