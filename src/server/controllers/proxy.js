var ejs = require('ejs');
var fs = require('fs');
var requester = require('request');

module.exports = function(app) {

	var Proxy = {};

	Proxy.doRequest = function(request, response, baseUrl) {

		var year = request.param('year');
		var tile = request.param('tile');
		var url = "http://maps.lapig.iesa.ufg.br/ows?layers=pasture_rebanho_regions_utfgrid&MSFILTER=year="+year+"&mode=tile&tile="+tile+"&tilemode=gmap&map.imagetype=utfgrid";

	  requester({
	  		uri: url
	  	,	timeout: 50000
	  	, headers: {
	  			'Accept': request.headers['accept']
	  		,	'User-Agent': request.headers['user-agent']
	  		,	'X-Requested-With': request.headers['x-requested-with']
	  		,	'Accept-Language': request.headers['accept-language']
	  		,	'Accept-Encoding': request.headers['accept-encoding']
	  	}
	  }, function(error, proxyResponse, body) {
	  	
	  	if(error) {
	  		console.log(error);
	  		response.end();	
	  	}

	  }).pipe(response)
	}

	return Proxy;

}