var crypto = require('crypto');

module.exports = function(app, passport) {

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/facebook', passport.authenticate('facebook'));

    // handle the callback after facebook has authenticated the user
    app.get('/facebook/callback', passport.authenticate('facebook', {
        successRedirect : '/',
        failureRedirect : '/'
    }));

    // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // route for google authentication and login
    app.get('/google', passport.authenticate('google', { scope: 'profile' }));

    // handle the callback after google has authenticated the user
    app.get('/google/callback', passport.authenticate('google', {
        successRedirect : '/',
        failureRedirect : '/'
    }));

    // =====================================
    // REDDIT ROUTES =======================
    // =====================================
    // route for reddit authentication and login
    app.get('/reddit', function(req, res, next){
        req.session.state = crypto.randomBytes(32).toString('hex');
        passport.authenticate('reddit', {
            state: req.session.state,
            duration: 'permanent',
        })(req, res, next);
    });

    // handle the callback after reddit has authenticated the user
    app.get('/reddit/callback', function(req, res, next){
        // Check for origin via state token
        if (req.query.state === req.session.state){
            passport.authenticate('reddit', {
                successRedirect: '/',
                failureRedirect: '/'
            })(req, res, next);
        }
        else {
            next( new Error(403) );
        }
    });

};