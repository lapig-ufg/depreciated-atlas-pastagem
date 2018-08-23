var util  = require('util')
	,	fs = require('fs')
	, redis = require('redis')
	, async = require('async')
	, crypto = require('crypto')
	,	mkdirp = require('mkdirp')
	, buffer = require('buffer');

var redisClient = redis.createClient(6379, '200.137.217.157');

getCache = function(cacheKey, callback) {
	redisClient.get(cacheKey, function(err, data) {
		if(!err && data) {
	    	var bitmap = Buffer.from(data,'Base64')
	    	callback(bitmap);
	    } else {
	    	callback(undefined);
	    }
  });
};

var testKeys = [
	'pastagem.org,pa_br_hidrografia_linear_1000_2009_ibge,EPSG:900913,-6178331.4575,-1705358.7329297,-6139195.6990234,-1666222.9744531,512,512,,image/png',
	'pastagem.org,utfgrid_default,EPSG:900913,-4402772.829226152,-1271912.1506653333,-4383204.949985147,-1252344.2714243263,512,512,,application/json',
	'pastagem.org,pa_br_estados_250_2013_ibge,EPSG:900913,-4462425.2919165,-2239342.8383643,-4459979.3070117,-2236896.8534595,512,512,,image/png'
]

var each = function(key, next) {
	console.log("Retriveing key " + key)
	getCache(key, function(data) {
		
		if(data) {

			var layer = key.split(',')[1]
			var newkey = crypto.createHash('md5').update(key).digest("hex");
			var dir = 'layers/'+layer

			mkdirp(dir, function(err) { 
				imgFile = dir+'/'+newkey+'.cache'
				
				fs.writeFile(imgFile, data, 'base64', function(err) {
					console.log("File "+ imgFile + " created")
					next()
				});

			});
		} else {
			console.log('Ignored.')
			next()
		}

	})
}

var complete = function() {
	console.log('fim')
	process.exit()
}

var keysContent = fs.readFileSync('keys.in', 'utf8');
var keys = keysContent.split('\n')
async.eachSeries(keys, each, complete);

