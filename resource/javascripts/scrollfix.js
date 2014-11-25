/**
 * scrollfix for season tabs in show.html template
 */
function updateOffset() {
    /**
     * difference of height in pixels between season tab pills list and active tab pane
     * @type {number}
     */
    var heightDifference = $('.shows .tab-pane.active').outerHeight() - $('.shows .col-md-12 .nav-pills').outerHeight();

    if (heightDifference > 0 ) {
        var scrollOffset = heightDifference +  + $('.show > .col-xs-12').outerHeight();

        if ($(this).scrollTop() < scrollOffset) {
            $('.shows ul.nav').css('position', 'fixed');
            $('.shows ul.nav').css('bottom','');
        }
        else {
            $('.shows ul.nav').css('position', 'absolute');
            $('.shows ul.nav').css('bottom', '0');
        }
    }
    else {
        $('.shows ul.nav').css('position', 'static');
        $('.shows ul.nav').css('bottom','');
    }
}

$(window).scroll(updateOffset);