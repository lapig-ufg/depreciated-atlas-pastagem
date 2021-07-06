const t = require('tiles-in-bbox'),
	async = require('async'),
	request = require('request');
const data = require('./muns');
const data_cerrado = require('./muns_cerrado');

const multipleRequests = 24
const maxZoomLevel     = 12
const ows_url          = "http://127.0.0.1:3000"
const bbox   = { bottom : -33.752081, left : -73.990450, top : 5.271841, right : -28.835908 } //Brazil*/
// const bbox = { bottom: -24.6846260, left: -60.1094198, top: -2.3262773, right: -41.5220189 } //Cerrado
// const ufs = ['GO', 'SP', 'MA', 'RO', 'PA', 'MS', 'TO', 'MT', 'PR', 'PI', 'BA', 'DF', 'MG'] /*UFS - Cerrado*/
const ufs    = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'] /*UFS - Brazil*/
// const muns = data_cerrado.muns;
const muns   = data.muns;
const biomas = ['AMAZONIA', 'CAATINGA', 'CERRADO', 'MATA ATLANTICA', 'PAMPA', 'PANTANAL'];
const layers = ["pasture_quality"]
const years  = [2010, 2018];
let urls     = []

// const types  = ['bioma', 'city', 'state', 'none']
const types  = ['bioma', 'none']

let qtdeRequests = 0;
for (let type of types) {
	if (type == 'none') {

		for (let layername of layers) {

			for (let year = (years.length - 1); year >= 0; year--) {
				// console.log("Year: " + years[year])
				for (let zoom = 0; zoom <= maxZoomLevel; zoom++) {
					let tiles = t.tilesInBbox(bbox, zoom)
					tiles.forEach(function (tile) {
						let url = ows_url +"/ows"
							+ "?layers=" + layername
							+ "&mode=tile"
							+ "&tilemode=gmap"
							+ "&map.imagetype=png"
							//+ "&map.imagetype=utfgrid"
							+ "&tile=" + [tile.x, tile.y, tile.z].join('+')

						url += "&MSFILTER=year=" + years[year]
						// console.log(url)
						urls.push(url)
					})
				}
			}
		}
	}
	else if (type == 'city') {
		for (let mun of muns) {
			for (let layername of layers) {
				for (let year = (years.length - 1); year >= 0; year--) {
					// console.log("Year: " + years[year])
					for (let zoom = 0; zoom <= maxZoomLevel; zoom++) {
						let tiles = t.tilesInBbox(bbox, zoom)
						tiles.forEach(function (tile) {
							var url = ows_url +"/ows"
								+ "?layers=" + layername
								+ "&mode=tile"
								+ "&tilemode=gmap"
								+ "&map.imagetype=png"
								//+ "&map.imagetype=utfgrid"
								+ "&tile=" + [tile.x, tile.y, tile.z].join('+')

							url += "&MSFILTER=year=" + years[year] + " AND cd_geocmu = '" + mun + "'"


							// console.log(url)
							urls.push(url)
						})
					}
				}
			}
		}
	}
	else if (type == 'state') {
		for (let uf of ufs) {
			for (let layername of layers) {
				for (let year = (years.length - 1); year >= 0; year--) {
					for (let zoom = 0; zoom <= maxZoomLevel; zoom++) {
						let tiles = t.tilesInBbox(bbox, zoom)
						qtdeRequests = qtdeRequests + tiles.length
						tiles.forEach(function (tile) {
							let url = ows_url +"/ows"
								+ "?layers=" + layername
								+ "&mode=tile"
								+ "&tilemode=gmap"
								+ "&map.imagetype=png"
								//+ "&map.imagetype=utfgrid"
								+ "&tile=" + [tile.x, tile.y, tile.z].join('+')

							url += "&MSFILTER=year=" + years[year] + " AND uf = '" + uf + "'"

							// console.log(url)
							urls.push(url)
						})
					}
				}
			}
		}
	}
	else if (type == 'bioma') {
		for (let bioma of biomas) {
			for (let layername of layers) {
				for (let year = (years.length - 1); year >= 0; year--) {
					for (let zoom = 0; zoom <= maxZoomLevel; zoom++) {
						let tiles = t.tilesInBbox(bbox, zoom)
						qtdeRequests = qtdeRequests + tiles.length
						tiles.forEach(function (tile) {
							let url = ows_url +"/ows"
								+ "?layers=" + layername
								+ "&mode=tile"
								+ "&tilemode=gmap"
								+ "&map.imagetype=png"
								//+ "&map.imagetype=utfgrid"
								+ "&tile=" + [tile.x, tile.y, tile.z].join('+')

							url += "&MSFILTER=year=" + years[year] + " AND bioma = '" + bioma + "'"

							// console.log(url)
							urls.push(url)
						})
					}
				}
			}
		}
	}
}

let requests = [];
const length = urls.length;
urls.forEach(function (url, index) {
	requests.push(function (next) {
		console.log("Caching: " + url)
		console.log((index / length * 100).toFixed(2) + "% done." )
		request(url, function (error, response, body) {
			next()
		});
	});
})

async.parallelLimit(requests, multipleRequests)
