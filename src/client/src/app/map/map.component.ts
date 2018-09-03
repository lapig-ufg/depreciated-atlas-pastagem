import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as ol from 'openlayers';

import OlMap from 'ol/map';
import OlXYZ from 'ol/source/xyz';
import OlTileLayer from 'ol/layer/tile';
import TileGrid from 'ol/tilegrid/tilegrid';
import TileWMS from 'ol/source/tilewms';
import OlView from 'ol/view';
import OlProj from 'ol/proj';
import OlExtent from 'ol/extent';

@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	styleUrls: [
		'./map.component.css'
	]
})
export class MapComponent implements OnInit {

	map: OlMap;
	layers: Array<TileWMS>;
	projection: OlProj;
	tileGrid: TileGrid;
	currentZoom: Number;

	indicator: any;
	urls: any;
	indexedLayers: any;
	tileloading: Number;

	checked = true;
	year = '1985'; 
	years: any;

	constructor(private http: HttpClient) { 
		this.indexedLayers = {};
		this.tileloading = 0;
		this.projection = OlProj.get('EPSG:900913');
		this.currentZoom = 4;

		this.urls = [
    	'http://o1.lapig.iesa.ufg.br/ows',
    	'http://o2.lapig.iesa.ufg.br/ows',
    	'http://o3.lapig.iesa.ufg.br/ows',
    	'http://o4.lapig.iesa.ufg.br/ows'
    ];

		this.tileGrid = new TileGrid({
    	extent: this.projection.getExtent(),
    	resolutions: this.getResolutions(this.projection),
      tileSize: 512
    });

		this.layers = [
      new OlTileLayer({
	      source: new OlXYZ({
		      wrapX: false,
		      url: 'https://api.tiles.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
		    })
	    })
    ];
	}

	private getResolutions(projection) {
		var projExtent = projection.getExtent();
    var startResolution = OlExtent.getWidth(projExtent) / 256;
    var resolutions = new Array(22);
    for (var i = 0, ii = resolutions.length; i < ii; ++i) {
      resolutions[i] = startResolution / Math.pow(2, i);
    }

    return resolutions
	}

	private createMap() {
		this.createLayers()
    this.map = new OlMap({
      target: 'map',
      layers: this.layers,
      view: new OlView({
	      center: OlProj.fromLonLat([-44, -14]),
	      projection: this.projection,
	      zoom: this.currentZoom,
	    }),
	    loadTilesWhileAnimating: true,
    	loadTilesWhileInteracting: true 
    });
	}

	private getXYZUrls() {
		
		var xyzUrls = []

		this.urls.forEach(function(url) {
			xyzUrls.push(url
				+ "?layers=pasture"
				+ "&MSFILTER=year="+this.year
				+ "&mode=tile&tile={x}+{y}+{z}"
				+ "&tilemode=gmap" 
				+ "&map.imagetype=png"
			);
		}.bind(this))

		return xyzUrls;
	}

	private createLayers() {
		var olLayers: OlTileLayer[] = new Array();

  	var olLayer = new OlTileLayer({
      source: new OlXYZ({
	      urls: this.getXYZUrls()
	    }),
	    visible: true,
	    tileGrid: this.tileGrid
    })

		this.indexedLayers['pasture'] = olLayer;
		olLayers.push(olLayer);

		this.layers = this.layers.concat(olLayers.reverse());

	}

	layerchecked(e){
		this.indexedLayers['pasture'].setVisible(e.checked);
	}

	updateyear(){

		this.http.get('/service/map/indicators?year='+this.year).subscribe(indicators => {
			this.indicator = indicators[0].sum;
		});

		var source = this.indexedLayers['pasture'].getSource()
		source.setUrls(this.getXYZUrls())
		source.refresh()
	}

	ngOnInit() {
		this.http.get('/service/map/indicators?year='+this.year).subscribe(indicators => {
			this.indicator = indicators[0].sum;
		});
		this.http.get('/service/map/years').subscribe(years => {
			this.years = years;
		});
		this.createMap();
	}

}
