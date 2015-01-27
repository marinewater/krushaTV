// app/routes.js
module.exports = function(app, dirname) {
	app.get('/', function(req, res) {
		res.sendFile(dirname + '/views/index.html');
	});

	// Favicons
	app.get('/favicon.ico', function(req, res) {
		res.sendFile(dirname + '/static/images/favicon.ico');
	});

	app.get('/apple-touch-icon-57x57.png', function(req, res) {
		res.sendFile(dirname + '/static/images/favicons/apple-touch-icon-57x57.png');
	});

	app.get('/apple-touch-icon-60x60.png', function(req, res) {
		res.sendFile(dirname + '/static/images/favicons/apple-touch-icon-60x60.png');
	});

	app.get('/apple-touch-icon-72x72.png', function(req, res) {
		res.sendFile(dirname + '/static/images/favicons/apple-touch-icon-72x72.png');
	});

	app.get('/apple-touch-icon-76x76.png', function(req, res) {
		res.sendFile(dirname + '/static/images/favicons/apple-touch-icon-76x76.png');
	});

	app.get('/apple-touch-icon-114x114.png', function(req, res) {
		res.sendFile(dirname + '/static/images/favicons/apple-touch-icon-114x114.png');
	});

	app.get('/apple-touch-icon-120x120.png', function(req, res) {
		res.sendFile(dirname + '/static/images/favicons/apple-touch-icon-120x120.png');
	});

	app.get('/apple-touch-icon-144x144.png', function(req, res) {
		res.sendFile(dirname + '/static/images/favicons/apple-touch-icon-144x144.png');
	});

	app.get('/apple-touch-icon-152x152.png', function(req, res) {
		res.sendFile(dirname + '/static/images/favicons/apple-touch-icon-152x152.png');
	});

	app.get('/apple-touch-icon-180x180.png', function(req, res) {
		res.sendFile(dirname + '/static/images/favicons/apple-touch-icon-180x180.png');
	});

	app.get('/favicon-32x32.png', function(req, res) {
		res.sendFile(dirname + '/static/images/favicons/favicon-32x32.png');
	});

	app.get('/favicon-194x194.png', function(req, res) {
		res.sendFile(dirname + '/static/images/favicons/favicon-194x194.png');
	});

	app.get('/favicon-96x96.png', function(req, res) {
		res.sendFile(dirname + '/static/images/favicons/favicon-96x96.png');
	});

	app.get('/android-chrome-192x192.png', function(req, res) {
		res.sendFile(dirname + '/static/images/favicons/android-chrome-192x192.png');
	});

	app.get('/favicon-16x16.png', function(req, res) {
		res.sendFile(dirname + '/static/images/favicons/favicon-16x16.png');
	});

	app.get('/android-chrome-manifest.json', function(req, res) {
		res.sendFile(dirname + '/static/images/favicons/android-chrome-manifest.json');
	});

	app.get('/mstile-144x144.png', function(req, res) {
		res.sendFile(dirname + '/static/images/favicons/mstile-144x144.png');
	});
};