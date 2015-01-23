//////////////////////////////
// krushaTV episode updater //
//////////////////////////////

// set environment variable
var env       = process.env.NODE_ENV || "development";

// DB Models
var models = require('./models');

// LOGGING
var bunyan	= require('bunyan');
var log_options = {
	name: 'krushaTV_update',
	streams: [{
        path: './log/krushaTV_update.log',
        level: 'error'
    }]
};
if (env !== 'production') {
	log_options.streams.push({
		level: 'info',
		stream: process.stdout 
	})
}
var log		= bunyan.createLogger(log_options);

// Scraping
var request = require('request');
var libxmljs = require("libxmljs");
var tvrage = require('./config/tvrage.json');

// Sanitizing
var sanitizeHtml = require('sanitize-html');

// File IO
var fs = require('fs');

/**
 * takes an array of episodes and updates existing episodes and creates new ones
 * @param  {Array}   episodes list of episodes
 * @param  {Function} callback function to call after save_episodes is done
 * @return {null}
 */
var save_episodes = function(episodes, callback) {
	if (episodes.length === 0) {
		process.nextTick(callback);
		return null;
	}

	/**
	 * starts the next iteration or calls the callback if all shows were processed
	 * @return {Function}
	 */
	var next = function() {
		if (episodes.length > 0)
			return save_episodes(episodes, callback);
		else
			return process.nextTick(callback);
	};

	var episode = episodes.shift();

	models.Episodes.findOne({ where: {
		'season': episode.season,
		'episode': episode.episode,
		'seriesid': episode.seriesid
	}}).then(function(ep) {
		if (!ep) {
			models.Episodes.create(episode, {
				fields: ['season', 'episode', 'title', 'airdate', 'seriesid']
			}).then(function() {
				next();
			}).catch(function(err) {
				log.error('Error in save_episodes', episode, err);
				next();
			});
		}
		else {
			if (ep.dataValues.update === true) {
				ep.updateAttributes(episode).then(function() {
					next();
				}).catch(function(err) {
					log.error('Failed to update episode', episode, err);
					next();
				});
			}
			else {
				next();
			}
		}


	}).catch(function(err) {
		log.error('Error in save_episodes', episode, err);
		next();
	});
};

/**
 * Scrapes show and episode data from the TVRage api and call functions to save the data
 * @param  {Array}   shows    Array of shows containing the TVRage showid and the local showid
 * @param  {Function} callback Function to call after get_show_info is finished
 * @return {null}
 */
var get_show_info = function(shows, callback) {
	var show = shows.shift();
	var tvr_showid = show.dataValues.showid;
	var loc_showid = show.dataValues.id;

	/**
	 * starts the next iteration or calls the callback if all shows were processed
	 * @return {Function}
	 */
	var next = function() {
		if (shows.length > 0) {
			return get_show_info(shows, callback);
		}
		else {
			return process.nextTick(callback());
		}
	};

	request(tvrage.baseurl + 'feeds/full_show_info.php?key=' + tvrage.key + '&sid=' + tvr_showid, function(error, response, body) {
		// get the xml feed from the TVRage api, parse it and call save_episodes to save them to the database
		if (!error && response.statusCode == 200) {
			var xml = libxmljs.parseXmlString(body);
			var xml_show = xml.get('/Show');

			log.info('updating %s', xml_show.get('./name').text());

			var episodes = [];

			xml_show.find('./Episodelist/Season').forEach(function(s) {
				var season_nr = parseInt(s.attr('no').value());

				s.find('./episode').forEach(function(e) {
					var airdate = e.get('./airdate').text() === '0000-00-00' ? null : e.get('./airdate').text();

					var title = sanitizeHtml(e.get('./title').text(), {
						allowedTags: []
					});
					
					episodes.push({
						'season': parseInt(season_nr),
						'episode': parseInt(e.get('./seasonnum').text()),
						'title': title,
						'airdate': airdate,
						'seriesid': loc_showid
					});
				});
			});

			save_episodes(episodes, function() {
				// if show has ended recently, update the show's entry in the database
				// ended shows will not be scraped anymore
				var status = xml_show.get('./status').text();
				var ended = (status === 'Ended' || status === 'Canceled');

				if (ended) {
					models.Series.update(
						{ 'ended': true },
						{ where: { 'id': loc_showid } }
					).then(function() {
						next();
					}).catch(function(err) {
						log.error({'local_showid': loc_showid, 'remote_showid': tvr_showid, 'type': 'show' }, 'Failed to update show (local showid: %d, tvRage showid: %d error: %s', loc_showid, tvr_showid, err);
						next();
					});
				}
				else {
					next();
				}
			});
		}
		else {
			log.error({'local_showid': loc_showid, 'remote_showid': tvr_showid, 'type': 'show' }, 'Failed to get show (local showid: %d, tvRage showid: %d error: %s', loc_showid, tvr_showid, error);
			next();
		}
	});
};

/**
 * retrieves showids from the database and calls the scraping function for each of the shows
 * @param  {Function} callback callback
 * @return {null}
 */
var update_all = function(callback) {
	/**
	 * call callback
	 * @return {Function} callback
	 */
	var next = function() {
		return process.nextTick(callback());
	};
	models.Series.findAll({
		attributes: ['showid', 'id'],
		where: {
			'ended': false
		}
	}).then(function(shows) {
		get_show_info(shows, function() {
			next();
		});
	}).catch(function(err) {
		log.error(err);
		next();
	});
};

/**
 * retrieves showids from the error log and calls the scraping function for each of the shows
 * @param  {Function} callback callback
 * @return {null}
 */
var update_errors = function(callback) {
	/**
	 * call callback
	 * @return {Function} callback
	 */
	var next = function() {
		return process.nextTick(callback());
	};

	var shows = [];

	fs.readFile('log/krushaTV_update.log', 'utf8', function (err, data) {
		if (err) {
			return console.log(err);
		}

		var errors_json = data.split(/[\n\u0085\u2028\u2029]|\r\n?/);
		errors_json.forEach(function(error_json) {
			var error = error_json.trim();

			if (error.length > 0) {
				var error_obj = JSON.parse(error);

				if (error_obj.hasOwnProperty('type') && error_obj.type === 'show') {
					shows.push({
						dataValues: {
							'id': error_obj.local_showid,
							'showid': error_obj.remote_showid
						}
					});
				}
			}
		});

		if (shows.length > 0)
			get_show_info(shows, next);
		else
			log.info('no errors in log');
	});


};

var init = function() {
	var args = process.argv.slice(2);

	var exit = function() {
		process.exit();
	};

	if (args.indexOf('errors') !== -1) {
		update_errors(exit);
	}
	else {
		update_all(exit);
	}
};

init();
