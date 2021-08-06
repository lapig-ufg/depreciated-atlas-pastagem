const envs = require('dotenv').config();
const dotenvExpand = require('dotenv-expand');
dotenvExpand(envs)

const express = require('express')
, load = require('express-load')
, path = require('path')
, compression = require('compression')
, responseTime = require('response-time')
, bodyParser = require('body-parser')
, multer = require('multer')
, parseCookie = require('cookie-parser');

const app = express();
const http = require('http').Server(app);
const cookie = parseCookie('LAPIG')

load('config.js', {'verbose': false})
.into(app);

	app.use(cookie);

	app.get('/atlas', function(req, res) {
		res.redirect('/');
	});

	app.get('/index.php/pt-br/', function(req, res) {
		res.redirect('/');
	});

	app.get('/map', function(req, res) {
		res.redirect('/');
	});
	
	app.use(compression());
	app.use(express.static(app.config.clientDir, { redirect: false }));
	app.get('*', function (request, response, next) {
		if (!request.url.includes('api') && !request.url.includes('service')) {
			response.sendFile(path.resolve(app.config.clientDir + '/index.html'));
		} else {
			next();
		}
	});
	app.set('views', __dirname + '/templates');
	app.set('view engine', 'ejs');

	const publicDir = path.join(__dirname, '');

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
