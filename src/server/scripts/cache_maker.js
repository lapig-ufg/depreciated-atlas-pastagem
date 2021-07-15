const t = require('tiles-in-bbox'),
	async = require('async'),
	request = require('request');
const data_muns    = require('./muns');
// const data_cerrado = require('./muns_cerrado');
const data_ufs     = require('./ufs');
const data_biomas  = require('./biomas');

const multipleRequests = 16
const maxZoomLevelNone = 13
const maxZoomLevel     = 12
const ows_url          = 'http://127.0.0.1:5000'
const bbox             = { bottom : -33.752081, left : -73.990450, top : 5.271841, right : -28.835908 } //Brazil*/

// const bbox   = { bottom: -24.6846260, left: -60.1094198, top: -2.3262773, right: -41.5220189 } //Cerrado
// const ufs    = ['GO', 'SP', 'MA', 'RO', 'PA', 'MS', 'TO', 'MT', 'PR', 'PI', 'BA', 'DF', 'MG'] /*UFS - Cerrado*/
// const ufs    = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'] /*UFS - Brazil*/
// const biomas = ['AMAZONIA', 'CAATINGA', 'CERRADO', 'MATA ATLANTICA', 'PAMPA', 'PANTANAL'];
// const muns   = data_cerrado.muns;

const ufs    = data_ufs.ufs;
const muns   = data_muns.muns;
const biomas = data_biomas.biomas;
const layers = ["pasture_quality"];
const years  = [2010, 2018];
let urls     = []

// const types  = ['none', 'city', 'state','bioma']
const types  = ['none']


for (let type of types) {
	if (type == 'none') {

		for (let layername of layers) {

			for (let year = (years.length - 1); year >= 0; year--) {
				// console.log("Year: " + years[year])
				for (let zoom = 0; zoom <= maxZoomLevelNone; zoom++) {
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
						const _bbox = {left: mun.left, right: mun.right, top: mun.top, bottom: mun.bottom}
						let tiles = t.tilesInBbox(_bbox, zoom)
						tiles.forEach(function (tile) {
							var url = ows_url +"/ows"
								+ "?layers=" + layername
								+ "&mode=tile"
								+ "&tilemode=gmap"
								+ "&map.imagetype=png"
								//+ "&map.imagetype=utfgrid"
								+ "&tile=" + [tile.x, tile.y, tile.z].join('+')

							url += "&MSFILTER=year=" + years[year] + " AND cd_geocmu = '" + mun.cd_geocmu + "'"

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
						const _bbox = {left: uf.left, right: uf.right, top: uf.top, bottom: uf.bottom}
						let tiles = t.tilesInBbox(_bbox, zoom)
						tiles.forEach(function (tile) {
							let url = ows_url +"/ows"
								+ "?layers=" + layername
								+ "&mode=tile"
								+ "&tilemode=gmap"
								+ "&map.imagetype=png"
								//+ "&map.imagetype=utfgrid"
								+ "&tile=" + [tile.x, tile.y, tile.z].join('+')

							url += "&MSFILTER=year=" + years[year] + " AND uf = '" + uf.uf + "'"

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
						const _bbox = {left: bioma.left, right: bioma.right, top: bioma.top, bottom: bioma.bottom}
						let tiles = t.tilesInBbox(_bbox, zoom)
						console.log(_bbox, zoom, tiles)
						tiles.forEach(function (tile) {

							let url = ows_url +"/ows"
								+ "?layers=" + layername
								+ "&mode=tile"
								+ "&tilemode=gmap"
								+ "&map.imagetype=png"
								//+ "&map.imagetype=utfgrid"
								+ "&tile=" + [tile.x, tile.y, tile.z].join('+')

							url += "&MSFILTER=year=" + years[year] + " AND bioma = '" + bioma.bioma + "'"

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
const length = urls.length
urls.forEach(function (url, index) {
	requests.push(function (next) {
		console.log((index / length * 100).toFixed(2) + "% done." );
		request(url, function (error, response, body) {
			next()
		});
	});
})

async.parallelLimit(requests, multipleRequests)