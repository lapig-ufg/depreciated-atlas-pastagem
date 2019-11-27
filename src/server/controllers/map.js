var pg = require('pg')
, fs = require('fs')
, json2csv = require('json2csv').parse
, archiver = require('archiver');


module.exports = function(app){
	var Map = {}

	var config = app.config;
	/*var conString = "postgres://postgres@localhost:5433/atlas_pastagem";*/
	var conString = "postgres://" + config.postgres.user + ":" + config.postgres.password + "@" + config.postgres.host + ":" + config.postgres.port + "/" + config.postgres.dbname;
	
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

	Map.fieldPoints = function(request, response) {
		var msfilter = request.param('msfilter', '');
		var condition;
		if(msfilter) {
			condition = ' WHERE '+msfilter;
		}

		var colums = "id, cobertura, obs, data, periodo, horario, altura, homoge, invasoras, gado, qtd_cupins, forrageira, solo_exp";
		var sqlQuery = "SELECT ST_AsGeoJSON(geom) geojson,"+colums+" FROM pontos_campo_parada"+condition;
		
		client.query(sqlQuery, (err, queryResult) => {
			if (err) {
				response.end()
			} else {
				
				var result = []
				var diretorioFotos = config.fotoDir;


				queryResult.rows.forEach(function(row) {

					result.push({
						'type': 'Feature',
          	'geometry': JSON.parse(row['geojson']),
          	'properties': {
          		'id': row['id'],
          		'foto': fs.readdirSync(diretorioFotos+row['id']),
          		'cobertura': row['cobertura'],
          		'obs': row['obs'],
          		'data': row['data'],
          		'periodo': row['periodo'],
          		'horario': row['horario'],
          		'altura': row['altura'],
          		'homoge': row['homoge'],
          		'invasoras': row['invasoras'],
          		'gado': row['gado'],
          		'qtd_cupins': row['qtd_cupins'],
          		'forrageira': row['forrageira'],
          		'solo_exp': row['solo_exp']
          	}
					})
				})

				response.send({
  				"type": "FeatureCollection",
  				"features": result
  			})
		    response.end();
			}
		});

	}

	Map.indicators = function(request, response){

		var msfilter = request.param('MSFILTER', '');

		client.query("SELECT year, SUM(area_ha) as area_ha, SUM(pol_ha) as area_mun FROM pasture WHERE "+msfilter+" GROUP BY year ORDER BY year", (err, res) => {

			var percentual_area_ha = ((res.rows[0].area_ha * 100) / res.rows[0].area_mun);

			res.rows.push({
				percentual_area_ha: percentual_area_ha
			})

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

	Map.indicatorsPastureBreBiomas = function(request, response){

		var msfilter = request.param('MSFILTER', '');
		var region = request.param('region', '')
		var otherFilter = '';

		if(region) {
			otherFilter = " WHERE "+region;
		}
		
		client.query("SELECT year, area_ha, (SELECT SUM(pol_ha) FROM regions "+otherFilter+") as area_mun FROM pasture_correction WHERE "+msfilter, (err, res) => {

			var percentual_area_ha = ((res.rows[0].area_ha * 100) / res.rows[0].area_mun);

			res.rows.push({
				percentual_area_ha: percentual_area_ha
			})

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

	Map.indicatorsPastureOld = function(request, response){

		var msfilter = request.param('MSFILTER', '');
		var filters = '';
		var otherFilter = '';

		if(msfilter) {
			filters = " AND "+msfilter;
			otherFilter = " WHERE "+msfilter;
		}

		client.query("SELECT SUM(area_ha), (SELECT SUM(pol_ha) FROM regions"+otherFilter+") as area_mun FROM pasture_all_transitions WHERE category = '1'"+filters, (err, res) => {

			var percentual_area_ha = ((res.rows[0].sum * 100) / res.rows[0].area_mun);

			res.rows.push({
				percentual_area_ha: percentual_area_ha
			})

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

	Map.indicatorsPotencialIntensificacao = function(request, response){

		var msfilter = request.param('MSFILTER', '');
		var filters = '';

		if(msfilter) {
			filters = " AND "+msfilter;
		}

		client.query("SELECT avg(potencial_int) FROM (SELECT cd_geocmu, max(potencial_int) potencial_int FROM potencial_intensificacao WHERE potencial_int > 0 " +filters+" GROUP BY 1) a", (err, res) => {

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

	Map.indicatorsRebanhoBovino = function(request, response){

		var msfilter = request.param('MSFILTER', '');
		var region = request.param('region', '');
		var area_pasture;
		var bioma = msfilter.split("=")
		var year = msfilter.split("AND")

		if(region == '' || region == 'bioma') {
			if(region == '') {
				area_pasture = "(SELECT area_ha FROM pasture_correction WHERE "+msfilter+" AND type = 'country')";
			} else {
				area_pasture = "(SELECT area_ha FROM pasture_correction WHERE "+year[0]+" AND name = "+bioma[2]+")";
			}
		} else {
			area_pasture = "(SELECT SUM(area_ha) FROM pasture WHERE "+msfilter+")";
		}
								 
		client.query("SELECT year, SUM(ua) as ua, sum(n_kbcs) as kbc, "+area_pasture+" as past_ha FROM lotacao_bovina_regions WHERE "+msfilter+" GROUP BY year ORDER BY year", (err, res) => {

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

	Map.indicatorsPastureDegraded = function(request, response){

		var msfilter = request.param('MSFILTER', '');
		var filters = " WHERE category='1'";
		var filtersRegions = '';

		if(msfilter) {
			filters = filters+" AND "+msfilter;
			filtersRegions = " WHERE "+msfilter;
		}

		client.query("SELECT SUM(area_ha), (SELECT SUM(pol_ha) FROM regions"+filtersRegions+") as area_mun FROM pasture_degraded_class"+filters, (err, res) => {

			var percentual_area_ha = ((res.rows[0].sum * 100) / res.rows[0].area_mun);

			res.rows.push({
				percentual_area_ha: percentual_area_ha
			})

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

	Map.indicatorsPoints = function(request, response){

		var msfilter = request.param('MSFILTER', '');
		var filters = '';

		if(msfilter) {
			filters = " WHERE "+msfilter;
		}

		client.query("SELECT COUNT(*) from pontos_campo_parada"+filters, (err, res) => {

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

	Map.indicatorsPointsTVITreinamento = function(request, response){

		var msfilter = request.param('MSFILTER', '');
		var filters = '';

		if(msfilter) {
			filters = " WHERE "+msfilter;
		}

		client.query("SELECT COUNT(*) from pontos_tvi_treinamento"+filters, (err, res) => {

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

	Map.indicatorsPointsTVIValidacao = function(request, response){

		var msfilter = request.param('MSFILTER', '');
		var filters = '';

		if(msfilter) {
			filters = " WHERE "+msfilter;
		}

		client.query("SELECT COUNT(*) from pontos_tvi_validacao"+filters, (err, res) => {

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

	Map.indicatorsPointsNoStop = function(request, response){

		var msfilter = request.param('MSFILTER', '');
		var filters = '';

		if(msfilter) {
			filters = " WHERE "+msfilter;
		}

		client.query("SELECT COUNT(*) from pontos_campo_sem_parada"+filters, (err, res) => {

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
		var regiao;
		var result = [];

		client.query("SELECT INITCAP(text) as text, value, type, uf FROM search WHERE TEXT LIKE '%"+keysearch+"%'", (err, res) => {

		  if (err) {
		    console.log(err.stack)
		    response.send(err)
				response.end()
		  } else {
		  	res.rows.forEach(function(row){

		  		if(row.uf === null) {
		  			regiao = row.text
		  		}else {
		  			regiao = row.text + " (" + row.uf + ")"
		  		}

		  		result.push({
		  			text: regiao,
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
		var regionType = request.param('type', '');
		var nameRegion = regionFilter.split('=')
		var filterBiomaPast;
		var result = [];
		var query_past;

		if(regionFilter != ''){
			regionFilter = "WHERE "+regionFilter

			if (regionType == 'bioma') {
				query_past = "SELECT * FROM pasture_correction WHERE name = "+nameRegion[1]
			} else {
				query_past = "SELECT year, SUM(area_ha) FROM pasture "+regionFilter+" GROUP BY year ORDER BY year"
			}

		} else {
			regionFilter_past_co = "WHERE type = 'country' "
			query_past = "SELECT * FROM pasture_correction "+regionFilter_past_co
		}

		client.query(query_past, (err, res) => {

			if (err) {
		    console.log(err.stack)
		    response.send(err)
				response.end()
		  } else {
		  	var series = [];

		  	res.rows.forEach(function(row){

		  		if (row.type) {
		  			series.push({
			  			name: row.year,
			  			value: row.area_ha,
			  			year: row.year,
			  			min: row.area_ha_min,
			  			max: row.area_ha_max
			  		})
		  		} else {
			  		series.push({
			  			name: row.year,
			  			value: row.sum,
			  			year: row.year
			  		})
		  		}


		  	})

	  		result.push({
					name: "Pastagem ha",
					series: series
				})
										 
				client.query("SELECT year, SUM(ua) as ua, sum(n_kbcs) as kbc FROM lotacao_bovina_regions "+regionFilter+" GROUP BY year ORDER BY year", (err, resLot) => {

					if (err) {
				    console.log(err.stack)
				    response.send(err)
						response.end()
				  } else {

						var seriesLotacaoBovina = [];

				  	resLot.rows.forEach(function(row){

				  		if(row.year != null) {
					  		seriesLotacaoBovina.push({
					  			name: row.year,
					  			value: row.ua,
					  			year: row.year
					  		})
				  		}

				  	})
				  		result.push({
								name: "Rebanho Bovino - UA",
								series: seriesLotacaoBovina
							})

						response.send(result)
						response.end()
				  }
				})

			}
		})
	}

	Map.chartsByYear = function(request, response) {

		var year = request.param('year', 2018);
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

	Map.ChartsTransitions =  function(request, response){

		var layer = request.param('layer', '');
		var region = request.param('region', '');

		if(region != ''){
			region = "WHERE "+region
		}

		var queryAll = "SELECT category, SUM(area_ha) from pasture_all_transitions "+region+" GROUP BY 1 ORDER BY 1;";
		var queryOne = "SELECT category, SUM(area_ha) from pasture_one_transitions "+region+" GROUP BY 1 ORDER BY 1;";
		var result = {
			'all': [],
			'one': []
		}
		
		client.query(queryAll, (err, res) => {
			
			res.rows.forEach(function(row){

				if(row.category == 1) {
					row.category = 'Pastagens Antigas'
				} else if(row.category == 2) {
					row.category = 'Pastagens antigas abandonadas/convertidas'
				} else if(row.category == 3) {
					row.category = 'Pastagens formadas a partir de 1985'
				} else if(row.category == 4) {
					row.category = 'Pastagens abandonadas/convertidas'
				} else if(row.category == 5) {
					row.category = 'Pastagens reformadas'
				} else if(row.category == 6) {
					row.category = 'Outras Pastagens'
				}

				result.all.push({
					value: row.sum,
					name: row.category
				})
			})

			client.query(queryOne, (err, city) => {


				city.rows.forEach(function(row){

					if(row.category == 1) {
						row.category = 'Pastagens formadas entre 1987 e 1996'
					} else if(row.category == 2) {
						row.category = 'Pastagens formadas entre 1997 e 2006'
					} else if(row.category == 3) {
						row.category = 'Pastagens formadas entre 2007 e 2016'
					} else if(row.category == 4) {
						row.category = 'Pastagens antigas convertidas entre 1987 e 1996'
					} else if(row.category == 5) {
						row.category = 'Pastagens antigas convertidas entre 1997 e 2006'
					} else if(row.category == 6) {
						row.category = 'Pastagens antigas convertidas entre 2007 e 2016'
					}

					result.one.push({
						value: row.sum,
						name: row.category
					})
				})
				response.send(result);
				response.end();
			})

		});
	}

	Map.downloadCSV = function(request, response) {

		var region = request.param('region', '');
		var file = request.param('file', '');
		var msfilter = request.param('filter', '');
		var filter = '';
		var filtersPastureDegraded = " WHERE category='1'";
		var sqlQuery;

		if(file == 'pasture') {
		 	sqlQuery =  "SELECT cd_geouf, cd_geocmu, uf, estado, municipio, SUM(area_ha) as area_pastagem, year FROM pasture WHERE "+region+" GROUP BY 1,2,3,4,5,7"
		} else if (file == 'pasture_degraded') {

			if(msfilter) {
				filtersPastureDegraded = filtersPastureDegraded+" AND "+msfilter;
			}

			sqlQuery =  "SELECT cd_geouf, cd_geocmu, uf, estado, municipio, SUM(area_ha) as area_past_degradada FROM pasture_degraded_class "+filtersPastureDegraded+" GROUP BY 1,2,3,4,5"
		} else if (file == 'lotacao_bovina_regions') {
			sqlQuery =  "SELECT cd_geouf, cd_geocmu, uf, estado, municipio, SUM(ua) as ua, sum(n_kbcs) as kbc, year FROM lotacao_bovina_regions WHERE "+region+" GROUP BY 1,2,3,4,5,8"
		} else if (file == 'potencial_intensificacao_pecuaria') {

			if(msfilter) {
				filter = " WHERE "+msfilter;
			}

			sqlQuery =  "SELECT cd_geouf, cd_geocmu, uf, estado, municipio, AVG(potencial_int) as potencial_intensificacao FROM potencial_intensificacao "+filter+" GROUP BY 1,2,3,4,5"
		}

		client.query(sqlQuery, (err, rows) => {
			if (err) {
				console.log(err)
				response.end()
			} else {

				var output = file+".csv";
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

	Map.downloadSHP = function(request, response) {

		var pathFile;
		var layer = request.param('file', '');
		var regionType = request.param('regionType', '');
		var region = request.param('region', '');
		var year = request.param('year', '');
		var fileParam = layer+'_'+year;

		if(layer != 'pasture') {
			fileParam = layer;
		}
		
		var diretorio = config.downloadDir+layer+'/'+regionType+'/'+region+'/';
		var	pathFile = diretorio+fileParam;

		if(fileParam.indexOf("../") == 0){
			res.send('Arquivo inválido!')
			res.end();
		} else if(fs.existsSync(pathFile+'.shp')) {
			var nameFile = regionType+'_'+region+'_'+fileParam
			response.setHeader('Content-disposition', 'attachment; filename='+nameFile+'.zip');
			response.setHeader('Content-type', 'application/zip')

			var zipFile = archiver('zip');
			zipFile.pipe(response);

			fs.readdir(diretorio, (err, files) => {
			  files.forEach(fileresult => {

			  	if(fileresult.indexOf(fileParam) == 0){
			  		var pathFile = diretorio+fileresult;
						zipFile.file(pathFile, {name:fileresult});
			  	}

			  });

				zipFile.finalize();
			})

		} else if(regionType == 'undefined'){
			var diretorioBR = config.downloadDir+layer+'/brasil/';
			var fileParamBR = year;
			var	pathFileBR = diretorioBR+fileParamBR;
			var nameFile = 'br_'+layer+'_'+year;

			if(layer != 'pasture') {
				pathFileBR = diretorioBR
				nameFile = 'br_'+layer
			}

			response.setHeader('Content-disposition', 'attachment; filename='+nameFile+'.zip');
			response.setHeader('Content-type', 'application/zip')

			var zipFile = archiver('zip');
			zipFile.pipe(response);

			if(fs.existsSync(pathFileBR)) {
				zipFile.directory(pathFileBR, fileParam);
			}

			zipFile.finalize();

		} else if (layer == 'pontos_campo_sem_parada' || layer == 'pontos_campo_parada' || layer == 'pontos_tvi_treinamento' || layer == 'pontos_tvi_validacao'){

				response.setHeader('Content-disposition', 'attachment; filename=' + layer+'.zip');
				response.setHeader('Content-type', 'application/zip')

				var diretorio = config.downloadDir+layer;

				var zipFile = archiver('zip');
				zipFile.pipe(response);

				if(fs.existsSync(diretorio)) {
					zipFile.directory(diretorio, layer);
				}

				zipFile.finalize();

		} else {
			response.send("Arquivo indisponível");
  		response.end();
		}
	}

	return Map;
}