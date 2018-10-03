var appRoot = require('app-root-path');

module.exports = function(app) {
	
	var config = {
		"appRoot": appRoot, 
		"clientDir": appRoot + "/../client/dist/",
		"langDir": appRoot + "/lang",
		"logDir": appRoot + "/log/",
		"port": 3000,
	};

	if(process.env.NODE_ENV == 'prod') {
		config["port"] = "4004"
	}

	return config;

}
