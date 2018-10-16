module.exports = function (app) {

	var map = app.controllers.map;
	
	app.get('/service/map/extent', map.extent);
	app.get('/service/map/indicators', map.indicators);
	app.get('/service/map/years', map.years);
	app.get('/service/map/search', map.search);
	app.get('/service/map/charts', map.charts);
	app.get('/service/map/chartsByYear', map.chartsByYear);
	app.get('/service/map/downloadCSV', map.downloadCSV);
	app.get('/service/map/downloadSHP', map.downloadSHP);
}
