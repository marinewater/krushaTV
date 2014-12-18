/**
 * @ngdoc directive
 * @name krushaTV.directive:scrollfix
 * @description makes sure that the seasons navigation is in the viewport
 * @restrict A
 */
krusha.directive('scrollfix', [function() {
    var link = function($scope, element) {
        var seasons_element = element.find('#seasons').first();
        var episodes_element = element.find('#episodes').first();

        // make sure updateOffset is not called too often (for better performance)
        var scroll_ok = true;
        var intervalID = setInterval(function () {
            scroll_ok = true;
        }, 17); // will be called ~60 times per second

        function updateOffset() {
            if (scroll_ok === true) {
                scroll_ok = false;

                var height_difference = episodes_element.outerHeight() - seasons_element.outerHeight();

                var scrollTop = $(this).scrollTop();


                if (height_difference < 0) {
                    seasons_element.removeClass('seasons-static');
                    seasons_element.removeClass('seasons-fixed');
                    seasons_element.addClass('seasons-relative');
                }
                else if (scrollTop < height_difference) {
                    seasons_element.addClass('seasons-fixed');
                    seasons_element.removeClass('seasons-static');
                    seasons_element.removeClass('seasons-relative');
                }
                else {
                    seasons_element.addClass('seasons-static');
                    seasons_element.removeClass('seasons-fixed');
                    seasons_element.removeClass('seasons-relative');
                }
            }
        }

        $(window).on('scroll', updateOffset);

        element.on('$destroy', function() {
            $(window).off('scroll', updateOffset);
            clearInterval(intervalID);
        });
    };

    return {
        restrict: 'A',
        link: link
    }
}]);