var appRoot = require('app-root-path');

module.exports = function(app) {
	
	var config = {
		"appRoot": appRoot, 
		"clientDir": appRoot + "/../client/dist/",
		"downloadDir": "/data/dados-lapig/download_atlas/",
		"fotoDir": "/Users/ferstefani/Documents/fotos_campo/",
		"langDir": appRoot + "/lang",
		"logDir": appRoot + "/log/",
		"postgres": {
			"host": "localhost",
			"port": "5433",
			"dbname": "lapig",
			"user": "lapig",
			"password": "lapig123",
		},
		"port": 3000,
	};

	if(process.env.NODE_ENV == 'prod') {
		config["downloadDir"] = "/STORAGE/download_atlas/",
		config["fotoDir"] = "/STORAGE/fotos_campo/",
		config["postgres"] = {
			"host": "172.18.0.4",
			"port": 5432,
			"dbname": "lapig",
			"user": "lapig",
			"password": "lapig123",
			"debug": true
		}
	}

	return config;

}
