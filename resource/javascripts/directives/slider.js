/**
 * @ngdoc directive
 * @name krushaTV.directive:slider
 * @description displays a slider, lets the user easily choose a value in a specified range
 * @restrict E
 * @scope
 * @param {number} min slider's floor
 * @param {number} max slider's ceiling
 * @param {number} step steps between slider's values
 * @param {expression} ngModel model
 * @param {function} onSlideStart callback, called when the user grabs the slider's handle
 * @param {function} onSlideStop callback, called when the user releases the slider's handle
 */
krusha.directive('slider', ['$timeout', function($timeout) {
    var body = $("body");

    var link = function($scope, element) {
        var slideStart = false;

        var bar = element.find(".bar");
        var barWidth = null;
        var barPositionLeft = null;
        var barPositionRight = null;
        var handle = element.find(".handle");
        var handleWidth = null;

        function addListeners(element) {
            handle.bind("mousedown touchstart", startSlide);
        }

        function init() {
            // jquery can't determine the width of an element if it is not visible
            if (bar.is(":visible")) {
                barWidth = bar.width();
                barPositionLeft = bar.offset().left;
                handleWidth = handle.width();
                barPositionRight = barPositionLeft + barWidth - handleWidth;

                $scope.$watch('model', function(model) {
                    // update tooltip position if handle is moved
                    if (!!slideStart) {
                        $timeout(function() {
                            handle.trigger('slideStartEvent');
                        });
                    }

                    var perc = (barWidth - handleWidth) / barWidth;
                    var step = (model - $scope.min) / ($scope.max - $scope.min) * 100 * perc;

                    handle.css("left", step + "%");
                });
            }
            else {
                $timeout(init, 100);
            }
        }

        function startSlide(event) {
            event.preventDefault();
            slideStart = true;

            $timeout(function() {
                handle.trigger('slideStartEvent');
            });

            handle.addClass('active');

            if (typeof $scope.onSlideStart !== "undefined") {
                $scope.onSlideStart();
            }

            body.bind("mouseup touchend", stopSlide);
            body.bind("mousemove", slideMouse);
            body.bind("touchmove", slideTouch);
        }

        function stopSlide(event) {
            event.preventDefault();
            slideStart = false;

            $timeout(function() {
                handle.trigger('slideStopEvent');
            });

            handle.removeClass('active');

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

        if (typeof $scope.tooltipPlacement === "undefined") {
            $scope.tooltipPlacement = 'top';
        }
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
            onSlideStop: '&',
            tooltipPlacement: '@'
        },
        template: '<div class="bar"><div class="handle" tooltip="{{ model }}" tooltip-placement="{{ ::tooltipPlacement }}" tooltip-trigger="slideStartEvent"></div></div>'
    }
}]);