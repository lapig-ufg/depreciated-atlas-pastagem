module.exports = function (app) {

	var map = app.controllers.map;
	
	app.get('/service/map/extent', map.extent);
	app.get('/service/map/fieldPoints', map.fieldPoints);
	app.get('/service/map/indicators', map.indicators);
	app.get('/service/map/indicatorsPastureBreBiomas', map.indicatorsPastureBreBiomas);
	app.get('/service/map/indicatorsPastureOld', map.indicatorsPastureOld);
	app.get('/service/map/indicatorsPotencialIntensificacao', map.indicatorsPotencialIntensificacao);
	app.get('/service/map/indicatorsRebanhoBovino', map.indicatorsRebanhoBovino);
	app.get('/service/map/indicatorsPastureDegraded', map.indicatorsPastureDegraded);
	app.get('/service/map/indicatorsPoints', map.indicatorsPoints);
	app.get('/service/map/indicatorsPointsNoStop', map.indicatorsPointsNoStop);
	app.get('/service/map/indicatorsPointsTVITreinamento', map.indicatorsPointsTVITreinamento);
	app.get('/service/map/indicatorsPointsTVIValidacao', map.indicatorsPointsTVIValidacao);
	app.get('/service/map/years', map.years);
	app.get('/service/map/search', map.search);
	app.get('/service/map/charts', map.charts);
	app.get('/service/map/chartsByYear', map.chartsByYear);
	app.get('/service/map/ChartsTransitions', map.ChartsTransitions);
	app.get('/service/map/downloadCSV', map.downloadCSV);
	app.get('/service/map/downloadSHP', map.downloadSHP);
}
