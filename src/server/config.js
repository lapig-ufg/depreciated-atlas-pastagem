const appRoot = require('app-root-path');

module.exports = function(app) {
	
	const config = {
		"appRoot": appRoot, 
		"clientDir": appRoot + process.env.CLIENT_DIR,
		"downloadDir": process.env.DOWNLOAD_DIR,
		"fotoDir": process.env.FOTO_DIR,
		"langDir": appRoot + process.env.LANG_DIR,
		"logDir": appRoot +  process.env.LOG_DIR,
		"postgres": {
			"host": process.env.PG_HOST,
			"port": process.env.PG_PORT,
			"dbname": process.env.PG_DBNAME,
			"user": process.env.PG_USER,
			"password": process.env.PG_PASSWORD,
		},
		"port": process.env.APP_PORT,
	};

	if(process.env.NODE_ENV == 'prod') {
		config["downloadDir"] = process.env.DOWNLOAD_DIR,
		config["fotoDir"] = process.env.FOTO_DIR,
		config["postgres"] = {
			"host": process.env.PG_HOST,
			"port": process.env.PG_PORT,
			"dbname": process.env.PG_DBNAME,
			"user": process.env.PG_USER,
			"password": process.env.PG_PASSWORD,
			"debug": true
		}
	}

	return config;

}
