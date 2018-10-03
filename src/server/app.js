var express = require('express')
, load = require('express-load')
, path = require('path')
, util    = require('util')
, compression = require('compression')
, responseTime = require('response-time')
, bodyParser = require('body-parser')
, multer = require('multer')
, parseCookie = require('cookie-parser');

var app = express();
var http = require('http').Server(app);
var cookie = parseCookie('LAPIG')

load('config.js', {'verbose': false})
.into(app);

	app.use(cookie);
	
	app.use(compression());
	app.use(express.static(app.config.clientDir));
	app.set('views', __dirname + '/templates');
	app.set('view engine', 'ejs');

	var publicDir = path.join(__dirname, '');

	app.use(responseTime());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(multer());

	app.use(function(error, request, response, next) {
		console.log('ServerError: ', error.stack);
		next();
	});

	load('controllers')
	.then('routes')
	.into(app);

	http.listen(app.config.port, function() {
		console.log('Atlas Pastagem Server @ [port %s] [pid %s]', app.config.port, process.pid.toString());
		if(process.env.PRIMARY_WORKER) {
			
		}
	});

process.on('uncaughtException', function (err) {
	console.error(err.stack);
});
