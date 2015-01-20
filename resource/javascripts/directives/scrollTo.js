/**
 * @ngdoc directive
 * @name krushaTV.directive:scrollTo
 * @description scrolls to a specified target if the element is clicked
 * @restrict A
 * @scope
 * @param {string} scroll-to target
 */
krusha.directive('scrollTo', function() {
    var link = function($scope, element, attr) {
        if (attr.scrollTo === '') {
            throw 'No target defined';
        }
        
        element.on('click', function() {
            $(document.body).animate({
                'scrollTop':   $(attr.scrollTo).offset().top - 70
            }, 200);
        });
    };
    
    return {
        restrict: 'A',
        scope: {},
        link: link
    }
});