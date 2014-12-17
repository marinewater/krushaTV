/**
 * @ngdoc directive
 * @name krushaTV.directive:slider
 * @description displays an symbol for a specified amount of time to indicate if a action has failed or succeeded
 * @restrict E
 * @scope
 * @param {number} min slider's floor
 * @param {number} max slider's ceiling
 * @param {number} step steps between slider's values
 * @param {expression} ngModel model
 * @param {function} onSlideStart callback, called when the user grabs the slider's handle
 * @param {function} onSlideStop callback, called when the user releases the slider's handle
 */
krusha.directive('slider', function($timeout) {
    var body = $("body");

    var link = function($scope, element) {

        var bar = element.find(".bar");
        var barWidth = null;
        var barPositionLeft = null;
        var barPositionRight = null;
        var handleWidth = null;

        function addListeners(element) {
            element.find(".handle").bind("mousedown touchstart", startSlide);
        }

        function init() {
            // jquery can't determine the width of an element if it is not visible
            if (bar.is(":visible")) {
                barWidth = bar.width();
                barPositionLeft = bar.offset().left;
                barPositionRight = barPositionLeft + barWidth;
                handleWidth = element.find('.handle').width();

                $scope.$watch('model', function(model) {
                    var perc = (barWidth - handleWidth) / barWidth;
                    var step = (model - $scope.min) / ($scope.max - $scope.min) * 100 * perc;

                    element.find(".handle").css("left", step + "%");
                });
            }
            else {
                $timeout(init, 100);
            }
        }

        function startSlide(event) {
            event.preventDefault();

            if (typeof $scope.onSlideStart !== "undefined") {
                $scope.onSlideStart();
            }

            body.bind("mouseup touchend", stopSlide);
            body.bind("mousemove", slideMouse);
            body.bind("touchmove", slideTouch);
        }

        function stopSlide(event) {
            event.preventDefault();
            body.unbind("mouseup touchend", stopSlide);
            body.unbind("mousemove", slideMouse);
            body.unbind("touchmove", slideTouch);

            if (typeof $scope.onSlideStop !== "undefined") {
                $scope.onSlideStop();
            }
        }

        function slideMouse(event) {
            event.preventDefault();
            slide(event.pageX);
        }

        function slideTouch(event) {
            event.preventDefault();
            slide(event.originalEvent.touches[0].pageX);
        }

        function slide(pageX) {

            var diff = null;

            if (barPositionLeft > pageX) {
                diff = 0;
            }
            else if (barPositionRight < pageX) {
                diff = barWidth;
            }
            else {
                diff = pageX - barPositionLeft;
            }

            $scope.$apply(function() {
                var temp_model = (parseInt($scope.min) + diff/barWidth * (parseInt($scope.max) - parseInt($scope.min)));
                $scope.model = temp_model - temp_model % $scope.step;
            });
        }

        init();

        addListeners(element);
    };

    return {
        restrict: 'E',
        link: link,
        scope: {
            min: '@',
            max: '@',
            step: '@',
            model: '=ngModel',
            onSlideStart: '&',
            onSlideStop: '&'
        },
        template: '<div class="bar"><div class="handle"></div></div>'
    }
});