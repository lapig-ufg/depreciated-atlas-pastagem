module.exports = function (app) {

	var proxy = app.controllers.proxy;

	app.get('/service/map/info-layer', proxy.doRequest);

}