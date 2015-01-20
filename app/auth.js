var crypto = require('crypto');

function set_keep_logged_in(req, res, next) {
    req.session.cookie_maxAge = req.query.keep === 'true';
    next();
}

function set_cookie_max_age(req, res) {
    if (!!req.session.cookie_maxAge) {
        req.session.cookie.maxAge = 31536000000; // 1 year
    }
    else {
        req.session.cookie.expires = false;
    }
    res.redirect('/');
}

module.exports = function(app, passport) {

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/facebook', set_keep_logged_in, passport.authenticate('facebook'));

    // handle the callback after facebook has authenticated the user
    app.get('/facebook/callback', passport.authenticate('facebook', {
        failureRedirect : '/login'
    }), set_cookie_max_age);

    // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // route for google authentication and login
    app.get('/google', set_keep_logged_in, passport.authenticate('google', { scope: 'profile' }));

    // handle the callback after google has authenticated the user
    app.get('/google/callback', passport.authenticate('google', {
        failureRedirect : '/'
    }), set_cookie_max_age);

    // =====================================
    // REDDIT ROUTES =======================
    // =====================================
    // route for reddit authentication and login
    app.get('/reddit', set_keep_logged_in, function(req, res, next){
        req.session.state = crypto.randomBytes(32).toString('hex');
        passport.authenticate('reddit', {
            state: req.session.state,
            duration: 'permanent'
        })(req, res, next);
    });

    // handle the callback after reddit has authenticated the user
    app.get('/reddit/callback', function(req, res, next){
        // Check for origin via state token
        if (req.query.state === req.session.state){
            passport.authenticate('reddit', {
                failureRedirect: '/'
            })(req, res, next);
        }
        else {
            next( new Error(403) );
        }
    }, set_cookie_max_age);

};