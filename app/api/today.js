module.exports = function(router, log, models) {
	router.get('/today', function(req, res, next) {
		var todaysEpisodes = null;

		if (req.isAuthenticated()) {
			todaysEpisodes = models.Episodes.getTodaysEpisodes(models, req.user.id);
		}
		else {
			todaysEpisodes = models.Episodes.getTodaysEpisodes(models);
		}

		todaysEpisodes.success(function(returning) {
			return res.json({
				'type': 'todaysEpisodes',
				'episodes': returning
			});
		}).error(function(err) {
			log.error('GET /api/today DB: ' + err);
			return next;
		});
	});
};