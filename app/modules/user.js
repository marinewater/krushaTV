module.exports = function(log, models) {
    return {
        createUser: function(username, password, done) {
            if (password.length < 6) {
                return done(null, false, 'pw_too_short');
            }

            // find a user whose username is the same as the forms username
            // we are checking to see if the user trying to login already exists
            models.User.find({ where: { 'username' :  username } }).success(function(user) {
                // check to see if theres already a user with that username
                if (user) {
                    return done(null, false, 'user_exists');
                }
                else {

                    // if there is no user with that username
                    // create the user
                    var newUser            = models.User.build({
                        'username': username,
                        'password': models.User.generateHash(password)
                    });

                    // save the user
                    newUser.save().success(function() {
                        return done(null, newUser);
                    }).error(function(err) {
                        if (err)
                            log.error('local-signup: ' + err);
                        return done(err);
                    });
                }

            }).error(function(err){
                return done(err);
            });
        },

        /**
         * route middleware to make sure a user is logged in
         * @param req
         * @param res
         * @param next
         * @returns {*}
         */
        isLoggedIn: function (req, res, next) {

            // if user is authenticated in the session, carry on
            if (req.isAuthenticated())
                return next();

            // if they aren't redirect them to the home page
            res.status(401);
            return res.json({
                'type': 'error',
                'code': 401,
                'message': 'not logged in'
            });
        },

        /**
         * route middleware to make sure a user is an admin
         * @param req
         * @param res
         * @param next
         * @returns {*}
         */
        isAdmin: function(req, res, next) {

            // if user is authenticated in the session, carry on
            if (req.isAuthenticated())
                if (req.user.admin === true) {
                    return next();
                }
                else {
                    res.status(403);
                    return res.json({
                        'type': 'error',
                        'code': 403,
                        'message': 'you do not have access to this resource'
                    });
                }
            else {
                // if they aren't redirect them to the home page
                res.status(401);
                return res.json({
                    'type': 'error',
                    'code': 401,
                    'message': 'not logged in'
                });
            }
        }
    };
};