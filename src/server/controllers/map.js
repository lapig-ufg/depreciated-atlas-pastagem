var pg = require('pg');

module.exports = function(app){
	var Map = {}

	var conString = "postgres://postgres@200.137.217.158:5432/atlas_pastagem";
	var client = new pg.Client(conString);
	client.connect();

	Map.indicators = function(request, response){

		var year = request.param('year', 1985);

		client.query("SELECT year, SUM(area_ha) FROM pasture WHERE year ="+year+" GROUP BY year ORDER BY year;", (err, res) => {

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
		client.query("SELECT DISTINCT(year) FROM pasture ORDER BY year;", (err, res) => {

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

	return Map;
}