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

var models = require('./models');

models.sequelize.sync()
	.then(function() {
		models.Series.addFullTextIndex();
		models.Series.addConstraints();
		models.User.addConstraints();
		models.WatchedEpisodes.addConstraints();
		models.TrackShow.addConstraints();
		models.Subreddits.addConstraints();
		models.Imdb.addConstraints();
	})
	.catch(function(err){
		log.error(err);
	})
	.finally( function() {

		process.exit( 0 );

	});