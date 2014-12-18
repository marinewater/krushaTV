/**
 * scrollfix for season tabs in show.html template
 */
function updateOffset() {
    var show = $('.show').first();
    var seasons = show.find('#seasons').first();

    var height_difference = show.find('#episodes').first().outerHeight() - seasons.outerHeight();

    var scrollTop = $(this).scrollTop();


    if (height_difference < 0) {
        seasons.removeClass('seasons-static');
        seasons.removeClass('seasons-fixed');
        seasons.addClass('seasons-relative');
    }
    else if (scrollTop < height_difference) {
        seasons.addClass('seasons-fixed');
        seasons.removeClass('seasons-static');
        seasons.removeClass('seasons-relative');
    }
    else {
        seasons.addClass('seasons-static');
        seasons.removeClass('seasons-fixed');
        seasons.removeClass('seasons-relative');
    }
}

$(window).scroll(updateOffset);