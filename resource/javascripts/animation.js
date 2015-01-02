krusha.animation('.fadeSuccess', function() {
    return {
        addClass: function(element, className, done) {
            $(element).fadeIn(100, "linear", done);
        },
        removeClass: function(element, className, done) {
            $(element).fadeOut(400, "linear", done);
        }
    };
});