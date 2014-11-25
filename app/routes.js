// app/routes.js
module.exports = function(app) {

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		res.sendfile('../views/index.html');
	});
};