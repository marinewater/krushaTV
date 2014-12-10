/**
 * scrollfix for season tabs in show.html template
 */
function updateOffset() {
    var show = $('.show').first();
    var seasons = show.find('#seasons').first();

    var height_difference = show.find('#episodes').first().outerHeight() - seasons.outerHeight();

    var scrollTop = $(this).scrollTop();

    if (scrollTop < height_difference) {
        seasons.addClass('seasons-fixed');
        seasons.removeClass('seasons-static');
    }
    else {
        seasons.addClass('seasons-static');
        seasons.removeClass('seasons-fixed');
    }
}

$(window).scroll(updateOffset);