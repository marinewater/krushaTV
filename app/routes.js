// app/routes.js
module.exports = function(app, dirname) {
	app.get('/', function(req, res) {
		res.sendFile(dirname + '/views/index.html');
	});

	app.get('/favicon.ico', function(req, res) {
		res.sendFile(dirname + '/static/images/favicon.ico');
	});
};