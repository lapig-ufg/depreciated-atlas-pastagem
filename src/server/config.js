var appRoot = require('app-root-path');

module.exports = function(app) {
	
	var config = {
		"appRoot": appRoot, 
		"clientDir": appRoot + "/../client/dist/",
		"downloadDir": appRoot + "/teste/",
		"downloadDir2": "/data/download_atlas/",
		"langDir": appRoot + "/lang",
		"logDir": appRoot + "/log/",
		"postgres": {
			"host": "postgres@200.137.217.158",
			"port": "5432",
			"dbname": "atlas_pastagem"
		},
		"port": 3000,
	};

	if(process.env.NODE_ENV == 'prod') {
		config["port"] = "4004"
	}

	return config;

}
