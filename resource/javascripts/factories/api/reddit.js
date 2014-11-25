/**
 * @ngdoc service
 * @name krushaTV.service:apiReddit
 * @description reddit api
 * @requires $http
 */
krusha.factory('apiReddit', ['$http', function($http) {
    return {
        /**
         * @ngdoc apiReddit.method
         * @methodOf krushaTV.service:apiReddit
         * @name apiReddit#subreddit
         * @description gets 5 hot threads from a subreddit
         * @param {string} subreddit subreddit (e.g. /r/firefly)
         * @returns {HttpPromise} HttpPromise
         */
        subreddit: function (subreddit) {
            return $http.get('//www.reddit.com' + subreddit + '/hot.json?limit=5');
        },

        /**
         * @ngdoc apiReddit.method
         * @methodOf krushaTV.service:apiReddit
         * @name apiReddit#reddit5more
         * @description gets the next 5 reddit threads, needs an "after" string from a previous request
         * @param {string} subreddit subreddit (e.g. /r/firefly)
         * @param {string} after after string from previous request of subreddit or reddit5more
         * @returns {HttpPromise} HttpPromise
         */
        reddit5more: function (subreddit, after) {
            return $http.get('//www.reddit.com' + subreddit + '/hot.json?limit=5&after=' + after);
        },

        /**
         * @ngdoc apiReddit.method
         * @methodOf krushaTV.service:apiReddit
         * @name apiReddit#submitSubreddit
         * @description a user can submit a subreddit if none has been accepted yet, an admin will need to verify it
         * @param {string} subreddit subreddit (e.g. /r/firefly or http://www.reddit.com/r/firefly)
         * @param {string} show_id local show id for the submitted subreddit
         * @returns {HttpPromise} HttpPromise
         */
        submitSubreddit: function (subreddit, show_id) {
            return $http.post('/api/subreddit', {'subreddit': subreddit, 'showid': show_id});
        },

        /**
         * @ngdoc apiReddit.method
         * @methodOf krushaTV.service:apiReddit
         * @name apiReddit#getSubmittedSubreddits
         * @description gets all submitted subreddits, needs admin permissions
         * @returns {HttpPromise} HttpPromise
         */
        getSubmittedSubreddits: function () {
            return $http.get('/api/admin/subreddit');
        },

        /**
         * @ngdoc apiReddit.method
         * @methodOf krushaTV.service:apiReddit
         * @name apiReddit#submitSubreddit
         * @description accepts a user submission for a subreddit; all future views of the show view will display 5 threads from this subreddit
         * once a submission is accepted, all submitted subreddits for this show will be deleted
         * @param {number} submission_id unique id for the subreddit that will be accepted
         * @returns {HttpPromise} HttpPromise
         */
        acceptSubmittedSubreddit: function (submission_id) {
            return $http.put('/api/admin/subreddit/' + submission_id);
        }
    }
}]);