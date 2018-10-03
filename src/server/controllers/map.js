var pg = require('pg')
, fs = require('fs')
, json2csv = require('json2csv').parse;

module.exports = function(app){
	var Map = {}
	var location = {};

	var conString = "postgres://postgres@200.137.217.158:5432/atlas_pastagem";
	var client = new pg.Client(conString);
	client.connect();

	Map.extent = function(request, response) {

		var region = request.param('region', '');
		var sqlQuery = "SELECT * from regions_geom WHERE "+region;
		
		client.query(sqlQuery, (err, queryResult) => {
			if (err) {
				console.log(err)
				response.end()
			} else {
				
				var result = {
          'type': 'Feature',
          'geometry': JSON.parse(queryResult.rows[0]['geom'])
        }

				response.send(result)
		    response.end();
			}
		});
	}

	Map.indicators = function(request, response){

		var msfilter = request.param('MSFILTER', '');
		client.query("SELECT year, SUM(area_ha) FROM pasture WHERE "+msfilter+" GROUP BY year ORDER BY year", (err, res) => {

		  if (err) {
		    console.log(err.stack)
		    response.send(err)
				response.end()
		  } else {
				response.send(res.rows)
				response.end()
		  }
		})
	}

	Map.years = function(request, response){

		var result = [];
		client.query("SELECT DISTINCT(year) FROM pasture ORDER BY year DESC;", (err, res) => {

		  if (err) {
		    console.log(err.stack)
		    response.send(err)
				response.end()
		  } else {
		  	res.rows.forEach(function(row){
		  		result.push(row.year)
		  	})
				response.send(result)
				response.end()
		  }
		})
	}

	Map.search = function(request, response) {

		var keysearch = request.param('key', 'BRASIL').toUpperCase();
		var result = [];

		client.query("SELECT INITCAP(text) as text, value, type FROM search WHERE TEXT LIKE '%"+keysearch+"%'", (err, res) => {

		  if (err) {
		    console.log(err.stack)
		    response.send(err)
				response.end()
		  } else {
		  	res.rows.forEach(function(row){
		  		result.push({
		  			text: row.text + " (" + row.type + ")",
		  			value: row.value,
		  			type: row.type,
		  			name: row.text
		  		})
		  	})

				response.send(result)
				response.end()
		  }
		})
	}

	Map.charts = function(request, response) {

		var regionFilter = request.param('region', '');
		var result = [];

		if(regionFilter != ''){
			regionFilter = "WHERE "+regionFilter
		}else{
			console.log('não tem region')
		}

		client.query("SELECT year, SUM(area_ha) FROM pasture "+regionFilter+" GROUP BY year ORDER BY year", (err, res) => {

			if (err) {
		    console.log(err.stack)
		    response.send(err)
				response.end()
		  } else {
		  	var series = [];

		  	res.rows.forEach(function(row){

		  		series.push({
		  			name: row.year,
		  			value: row.sum,
		  			year: row.year
		  		})

		  	})

	  		result.push({
					name: "Pastagem",
					series: series
				})

				response.send(result)
				response.end()
			}
		})
	}

	Map.chartsByYear = function(request, response) {

		var year = request.param('year', 2017);
		var index = 1;
		var stateQuery = "SELECT INITCAP(estado) as estado, uf, SUM(area_ha), year from pasture WHERE year="+year+" GROUP BY estado, uf, year ORDER BY 3 DESC"
		var cityQuery = "SELECT INITCAP(municipio) as municipio, uf, SUM(area_ha), year from pasture WHERE year="+year+" GROUP BY 1, 2, 4 ORDER BY 3 DESC LIMIT 10"
		var result = {
			'state': [],
			'cities': []
		}

		client.query(stateQuery, (err, res) => {
			
			res.rows.forEach(function(row){
				result.state.push({
					estado: row.estado,
					value: row.sum,
					name: row.uf
				})
			})

			client.query(cityQuery, (err, city) => {

				city.rows.forEach(function(row){
					result.cities.push({
						name: row.municipio,
						value: row.sum,
						uf: row.uf,
						index: index++ + 'º'
					})
				})
				response.send(result);
				response.end();
			})

		});
	}

	Map.downloadCSV = function(request, response) {

		var region = request.param('region', '');
		var sqlQuery =  "SELECT cd_geouf, cd_geocmu, regiao, uf, estado, municipio, bioma, arcodesmat, matopiba, mun_ha, area_ha, year FROM pasture WHERE "+region
		client.query(sqlQuery, (err, rows) => {
			if (err) {
				console.log(err)
				response.end()
			} else {

				var output = "area_pastagem.csv";
				var csv = json2csv(rows.rows);

				fs.writeFile(output, csv, function(err) {
          response.setHeader('Content-disposition', 'attachment; filename='+output);
          response.set('Content-Type', 'text/csv');
          response.send(csv);
          response.end();
				});

			}
		});
	}

	return Map;
}