// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var RedditStrategy = require('passport-reddit').Strategy;

var configAuth = require('./auth');

// uuid generator
var FlakeIdGen = require('flake-idgen')
    , intformat = require('biguint-format')
    , generator = new FlakeIdGen;

// expose this function to our app using module.exports
module.exports = function(passport, log, models, user) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        models.User.find({ where: { 'id': id } }).then(function(user) {
            done(null, user);
        }).catch(function(err) {
            done(err, null);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'



    passport.use('local-login', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with username and password from our form

        // find a user whose username is the same as the forms username
        // we are checking to see if the user trying to login already exists
        models.User.find({ where: { 'username' :  username } }).then(function(user) {
            // if the user is found but the password is wrong
            if (!user || !user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'User and password combination not found.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user.dataValues);

        }).catch(function(err) {
            log.error('local-login: ' + err);
            return done(err);
        });

    }));

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with username
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {

        // asynchronous
        // User.find wont fire unless data is sent back
        process.nextTick(function() {

            user.createUser(username, password, done);
        });
    }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL

    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
            models.User.find({
                where: { 'facebookid' : profile.id }
            }).then(function(user) {
                if (user !== null) {
                    return done(null, user);
                }
                else {
                    var newUser            = models.User.build({
                        'username': profile.name.givenName + ' ' + profile.name.familyName,
                        'facebookid': profile.id,
                        'facebooktoken': token
                    });

                    // save the user
                    newUser.save().then(function() {
                        return done(null, newUser);
                    }).catch(function(err) {
                        if (err.name === 'SequelizeUniqueConstraintError') {
                            var id_base = generator.next();
                            var uuid = intformat(id_base, 'dec');
                            newUser.username += ' ' + uuid;

                            // save the user
                            newUser.save().then(function() {
                                return done(null, newUser);
                            }).catch(function(err) {
                                log.error('Facebook Auth: ' + err);
                                return done(err);
                            });
                        }
                        else {
                            log.error('Facebook Auth: ' + err);
                            return done(err);
                        }
                    });
                }
            }).catch(function(err) {
                log.error('Facebook Auth: ' + err);
                return done(err);
            });
        });

    }));

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL
    },

    // google will send back the token and profile
    function(token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their google id
            models.User.find({
                where: { 'googleid' : profile.id }
            }).then(function(user) {
                if (user !== null) {
                    return done(null, user);
                }
                else {
                    var newUser            = models.User.build({
                        'username': profile.displayName,
                        'googleid': profile.id,
                        'googletoken': token
                    });

                    // save the user
                    newUser.save().then(function() {
                        return done(null, newUser);
                    }).catch(function(err) {
                        if (err.name === 'SequelizeUniqueConstraintError') {
                            var id_base = generator.next();
                            var uuid = intformat(id_base, 'dec');
                            newUser.username += ' ' + uuid;

                            // save the user
                            newUser.save().then(function() {
                                return done(null, newUser);
                            }).catch(function(err) {
                                log.error('Google Auth: ' + err);
                                return done(err);
                            });
                        }
                        else {
                            log.error('Google Auth: ' + err);
                            return done(err);
                        }
                    });
                }
            }).catch(function(err) {
                log.error('Google Auth: ' + err);
                return done(err);
            });
        });

    }));

    // =========================================================================
    // REDDIT ==================================================================
    // =========================================================================
    passport.use(new RedditStrategy({
        clientID: configAuth.redditAuth.clientID,
        clientSecret: configAuth.redditAuth.clientSecret,
        callbackURL: configAuth.redditAuth.callbackURL
    },

    // reddit will send back the token and profile
    function(token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their reddit id
            models.User.find({
                where: { 'redditid' : profile.id }
            }).then(function(user) {
                if (user !== null) {
                    return done(null, user);
                }
                else {
                    var newUser            = models.User.build({
                        'username': profile.name,
                        'redditid': profile.id,
                        'reddittoken': token
                    });

                    // save the user
                    newUser.save().then(function() {
                        return done(null, newUser);
                    }).catch(function(err) {
                        if (err.name === 'SequelizeUniqueConstraintError') {
                            var id_base = generator.next();
                            var uuid = intformat(id_base, 'dec');
                            newUser.username += ' ' + uuid;

                            // save the user
                            newUser.save().then(function() {
                                return done(null, newUser);
                            }).catch(function(err) {
                                log.error('Google Auth: ' + err);
                                return done(err);
                            });
                        }
                        else {
                            log.error('Google Auth: ' + err);
                            return done(err);
                        }
                    });
                }
            }).catch(function(err) {
                log.error('Google Auth: ' + err);
                return done(err);
            });
        });

    }));

};