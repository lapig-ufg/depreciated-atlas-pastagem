module.exports = function (app) {

	var map = app.controllers.map;
	
	app.get('/service/map/indicators', map.indicators);
	app.get('/service/map/years', map.years);

}
