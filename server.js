// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = exports.app = express();
var port     = process.env.PORT || 3000;
var passport = require('passport');
var flash    = require('connect-flash');

var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

// set environment variable
var env       = process.env.NODE_ENV || "development";

// LOGGING
var bunyan	= require('bunyan');
var log_options = {name: 'krushaTV'};

if (env === 'production') {
	log_options.streams = [{
        path: './log/krushaTV.log'
    }]
}
var log		= bunyan.createLogger(log_options);

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router
var admin_router = express.Router();
var auth_router = express.Router();

// configuration ===============================================================
var models = require('./models');

// require('./config/passport')(passport); // pass passport for configuration

// redis cache
var redis = require("redis").createClient();


// Modules
var user = require('./app/modules/user.js')(log, models);

// set up our express application
app.use(cookieParser()); // read cookies (needed for auth)
// get information from html forms
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
	secret: 'zJoOCuFay8zKjEMDDN40yPC6rvNK7r', // session secret
	saveUninitialized: true,
	resave: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
require('./config/passport.js')(passport, log, models, user);

// routes ======================================================================
app.use("/static", express.static(__dirname + '/static')); // serve static files
// api =========================================================================
// auth
require('./app/api/user.js')(router, log, models, passport);
require('./app/auth.js')(auth_router, passport);

require('./app/api/today.js')(router, log, models);
require('./app/api/search.js')(router, log, models, redis);
require('./app/api/show.js')(router, log, models);
require('./app/api/trackshow.js')(router, log, models);
require('./app/api/subreddit.js')(router, log, models);
require('./app/api/imdb.js')(router, log, models);
require('./app/api/unwatched.js')(router, log, models);
require('./app/api/admin/reddit.js')(admin_router, log, models);
require('./app/api/admin/imdb.js')(admin_router, log, models);
require('./app/api.js')(router);

app.use('/api', router);
app.use('/api/admin', admin_router);
app.use('/auth', auth_router);

// return index for every not assigned url to get angular's html5 mode to work
app.use(function(req, res) {
	res.sendFile(__dirname + '/views/index.html');
});

// launch ======================================================================
models.sequelize.sync()
	.done(function() {
        models.Series.addFullTextIndex();
		models.Series.addConstraints();
        models.WatchedEpisodes.addConstraints();
        models.TrackShow.addConstraints();
        models.Subreddits.addConstraints();
		models.Imdb.addConstraints();
    })
    .success(function () {
		var server = app.listen(port);
		log.info("Server is listening on port " + port);
	})
	.error(function(err){
		log.error(err);
	});