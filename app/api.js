module.exports = function(router) {
	router.get('/', function(req, res) {
		return res.json({ message: 'hooray! welcome to our api!' });	
	});
};