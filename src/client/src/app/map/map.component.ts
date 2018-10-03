import {Component, Injectable, OnInit} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';

import {Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import {catchError, debounceTime, distinctUntilChanged, map, tap, switchMap} from 'rxjs/operators';
import * as ol from 'openlayers';

import BingMaps from 'ol/source/bingmaps';
import TileArcGISRest from 'ol/source/tilearcgisrest';
import OlMap from 'ol/map';
import OlXYZ from 'ol/source/xyz';
import OlTileLayer from 'ol/layer/tile';
import VectorLayer from 'ol/layer/vector';
import TileGrid from 'ol/tilegrid/tilegrid';
import TileWMS from 'ol/source/tilewms';
import VectorSource from 'ol/source/vector';
import Stroke from 'ol/style/stroke';
import Fill from 'ol/style/fill';
import Style from 'ol/style/style';
import OlView from 'ol/view';
import OlProj from 'ol/proj';
import OlExtent from 'ol/extent';
import TileUTFGrid from 'ol/source/tileutfgrid';
import Overlay from 'ol/overlay';
import GeoJSON from 'ol/format/geojson';
import _ol_TileUrlFunction_ from 'ol/tileurlfunction.js';
import "rxjs/add/observable/of";

const SEARCH_URL = '/service/map/search';
const PARAMS = new HttpParams({
  fromObject: {
    format: 'json'
  }
});

@Injectable()
export class SearchService {
  constructor(private http: HttpClient) {}

  search(term: string) {
    if (term === '') {
      return of([]);
    }

    return this.http.get(SEARCH_URL, {params: PARAMS.set('key', term)}).pipe(
        map(response => response)
      );
  }
}

@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	providers: [SearchService],
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
	checkedLegend = true;
	year = '2017'; 
	years: any;
	regions: any;

	charts: any;
	chartResult: any;
	chartResultStates: any;
	regionSelected: 'Brasil';
	regionTypeCharts: '';

	model = '';
  searching = false;
  searchFailed = false;
  msFilterRegion = '';
  msFilterRegionCharts = '';
  chartResultCities: any;

  collapseLayer: boolean;
  collapseCharts: boolean;
  collapseLegends: boolean;

  layerLegend: any;
  colorScheme = {
    name: 'chartsPasture',
    selectable: true,
    group: 'Ordinal',
    domain: ['#ffc107', '#7aa3e5', '#a8385d', '#00bfa5']
  };
  colorSchemeStates = ('solar');
  colorSchemeStatesType = ('linear');

  pastagem: any;
  pastagem_municipios: any;
  estados: any;
  biomas: any;
  municipios: any;
  terras_indigenas: any;
  unidades_protecao_integral: any;
  frigorificos: any;
  mapbox: any;
  satelite: any;
  estradas: any;
  landsat: any;
  relevo:any

  regionSource: any;
  region_geom: any;
  linkDownload: any;
  layerPastureShow = 'areas-pastagens';
  baseMap= 'mapbox';
  hectares = "hectares";
  estadosCharts = "estados";

	constructor(private http: HttpClient, private _service: SearchService) { 
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

    this.layers = []
	}

	search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term =>
        this._service.search(term).pipe(
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          }))
      ),
      tap(() => this.searching = false)
    )

  formatter = (x: {text: string}) => x.text;

  private updateRegion(region) {

  	this.regionSelected = region.item.name;
  	this.regionTypeCharts = region.item.type
  	var regionType = region.item.type;
  	var region = region.item.value;
  	this.region_geom = region


  	if(regionType == 'estado') {
  		regionType = 'uf'
  	}else if (regionType == 'municipio') {
  		regionType = 'cd_geocmu'
  	}else if (regionType == 'região de fronteira' && region == "MATOPIBA") {
  		regionType = 'MATOPIBA'
  		region = '1'
  		this.region_geom = 'MATOPIBA'
  	}else if (regionType == 'região de fronteira' && region == "ARCODESMAT") {
  		regionType = 'ARCODESMAT'
  		region = '1'
  		this.region_geom = 'ARCODESMAT'
  	}


  	this.msFilterRegion = " AND "+regionType+"='"+region+"'";
  	this.msFilterRegionCharts = regionType+"='"+region+"'";

  	this.zoomExtent();

  	this.updateCharts();
  	this.sumIndicators();
  	this.updateSourceLayer();
  	this.updateChartsYears();
  }

  private zoomExtent() {
  	var map = this.map;
  	if (this.regionTypeCharts != '') {
			this.http.get('/service/map/extent?region=text='+"'"+this.region_geom+"'").subscribe(extentResult => {
				var features = (new GeoJSON()).readFeatures(extentResult, {
				  dataProjection : 'EPSG:4326',
				  featureProjection: 'EPSG:3857'
				});
				this.regionSource = this.regions.getSource();
				this.regionSource.clear()
				this.regionSource.addFeature(features[0])
				var extent = features[0].getGeometry().getExtent();
				map.getView().fit(extent, { duration: 1500 });
			})
		}
  }

  private updateSourceLayer(){
  	var source_pastagem_area = this.pastagem.layer.getSource()
		var source_pastagem_municipio = this.pastagem_municipios.layer.getSource()

		source_pastagem_area.setUrls(this.getUrls(this.pastagem.layername, this.pastagem.layerfilter))
		source_pastagem_municipio.setUrls(this.getUrls(this.pastagem_municipios.layername, this.pastagem_municipios.layerfilter))

		source_pastagem_area.refresh();
		source_pastagem_municipio.refresh();
  }

  formatLabel(value: number | null) {
    if (!value) {
      return 0;
    }

    if (value >= 100) {
      return Math.round(value / 100) + '%';
    }

    return value;
  }

  getMatchRegion(){
  		this.region_geom = 'BRASIL'
			this.zoomExtent();
  	  this.model = '';
			this.msFilterRegion = '';
			this.msFilterRegionCharts = '';
			this.regionTypeCharts = '';
			this.regionSelected = 'Brasil';
			this.sumIndicators();
			this.updateSourceLayer();
			this.updateCharts();
			this.updateChartsYears();
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

	private createVectorLayer() {
    return new VectorLayer({
      source: new VectorSource({
	      //features: (new GeoJSON()).readFeatures(extentResult)
	    }),
	    style: [
	      new Style({
	        stroke: new Stroke({
	          color: '#dedede',
	          width: 4
	        })
	      }),
		    new Style({
	        stroke: new Stroke({
	          color: '#663300',
	          width: 3
	        })
	      }),
      ]
    });
	}

	private createMap() {
		this.createBaseLayers();
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

	private getUrls(layername, filter) {
		
		var result = []

		var msfilter = ""
		if(filter)
			msfilter = '&MSFILTER='+"year="+this.year+''+this.msFilterRegion
		
		for (let url of this.urls) {
			result.push(url
				+ "?layers=" + layername
				+ msfilter
				+ "&mode=tile&tile={x}+{y}+{z}"
				+ "&tilemode=gmap" 
				+ "&map.imagetype=png"
			);
		}

		return result;
	}

	private createTMSLayer(layername, visible, opacity, filter) {
		return new OlTileLayer({
			source: new OlXYZ({
				urls: this.getUrls(layername, filter)
			}),
			tileGrid: this.tileGrid,
			visible: visible,
			opacity: opacity
		});
	}

	private createBaseLayers() {
		console.log(this.tileGrid)
		this.mapbox = {
			visible: true,
			layer: new OlTileLayer({
	      source: new OlXYZ({
		      wrapX: false,
		      url: 'https://api.tiles.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
		    }),
				visible: true
	    })
		}
    
    this.satelite = {
			visible: false,
			layer: new OlTileLayer({
	      preload: Infinity,
        source: new BingMaps({
          key: 'VmCqTus7G3OxlDECYJ7O~G3Wj1uu3KG6y-zycuPHKrg~AhbMxjZ7yyYZ78AjwOVIV-5dcP5ou20yZSEVeXxqR2fTED91m_g4zpCobegW4NPY',
          imagerySet: 'Aerial'
        }),
				visible: false
	    })
	  }

	  this.estradas = {
			visible: false,
			layer: new OlTileLayer({
	      preload: Infinity,
        source: new BingMaps({
          key: 'VmCqTus7G3OxlDECYJ7O~G3Wj1uu3KG6y-zycuPHKrg~AhbMxjZ7yyYZ78AjwOVIV-5dcP5ou20yZSEVeXxqR2fTED91m_g4zpCobegW4NPY',
          imagerySet: 'Road'
        }),
				visible: false
	    })
	  }

	  this.relevo = {
			visible: false,
			layer: new OlTileLayer({
				source: new OlXYZ({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' +
          			'World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}'
        }),
				visible: false,
	    })
	  }

	  this.landsat = {
			visible: false,
			layer: new OlTileLayer({
				source: new TileWMS({
          url: 'http://seeg-mapbiomas.terras.agr.br/wms',
          projection: 'EPSG:3857',
          params: {'LAYERS': 'rgb', 
          					'SERVICE': 'WMS',
          					'TILED': true,
          					'VERSION': '1.1.1',
          					'TRANSPARENT': 'true', 
          					'MAP': 'wms/v/3.0/classification/rgb.map', 
          					'YEAR': 2017
         	},
         	serverType: 'mapserver',
          tileGrid: this.tileGrid
        }),
				visible: false,
	    })
	  }

    this.layers.push(this.mapbox.layer)
    this.layers.push(this.satelite.layer)
    this.layers.push(this.estradas.layer)
    this.layers.push(this.relevo.layer)
    this.layers.push(this.landsat.layer)

	}

	private createLayers() {
		var olLayers: OlTileLayer[] = new Array();

		this.pastagem = {
			label: 'Áreas de Pastagens do Brasil',
			tooltip: 'Áreas de Pastagens do Brasil',
			layername: "pasture",
			visible: true,
			opacity: 1,
			layerfilter: 'sim'
		}

		this.pastagem_municipios = {
			label: 'Áreas de Pastagens do Brasil',
			tooltip: 'Áreas de Pastagens do Brasil',
			layername: "pasture_regions_municipios",
			visible: false,
			opacity: 1,
			layerfilter: 'sim'
		}

		this.estados = {
			label: 'Limites dos Estados do Brasil',
			tooltip: 'Limites dos Estados do Brasil',
			layername: "estados",
			visible: true,
			opacity: 1
		}

		this.municipios = {
			label: 'Limites dos Municipios do Brasil',
			tooltip: 'Limites dos Municipios do Brasil',
			layername: "municipios",
			visible: false,
			opacity: 1
		}

		this.biomas = {
			label: 'Limites dos Biomas do Brasil',
			tooltip: 'Limites dos Biomas do Brasil',
			layername: "biomas",
			visible: false,
			opacity: 1
		}

		this.terras_indigenas = {
			label: 'Limites das Terras Indígenas do Brasil',
			tooltip: 'Limites das Terras Indígenas do Brasil',
			layername: "limites_terras_indigenas",
			visible: false,
			opacity: 1
		}

		this.unidades_protecao_integral = {
			label: 'Limites das Unidades de Protecao Integral do Brasil',
			tooltip: 'Limites das Unidades de Protecao Integral do Brasil',
			layername: "limites_unidades_protecao_integral",
			visible: false,
			opacity: 1
		}

		this.frigorificos = {
			label: 'Limites das Unidades de Protecao Integral do Brasil',
			tooltip: 'Limites das Unidades de Protecao Integral do Brasil',
			layername: "limites_frigorificos",
			visible: false,
			opacity: 1
		}

		this.pastagem['layer'] = this.createTMSLayer(this.pastagem.layername, this.pastagem.visible, this.pastagem.opacity, this.pastagem.layerfilter);
		this.pastagem_municipios['layer'] = this.createTMSLayer(this.pastagem_municipios.layername, this.pastagem_municipios.visible, this.pastagem_municipios.opacity, this.pastagem_municipios.layerfilter);
		this.estados['layer'] = this.createTMSLayer(this.estados.layername, this.estados.visible, this.estados.opacity, '')
		this.municipios['layer'] = this.createTMSLayer(this.municipios.layername, this.municipios.visible, this.municipios.opacity, '')
		this.biomas['layer'] = this.createTMSLayer(this.biomas.layername, this.biomas.visible, this.biomas.opacity, '')
		this.terras_indigenas['layer'] = this.createTMSLayer(this.terras_indigenas.layername, this.terras_indigenas.visible, this.terras_indigenas.opacity, '')
		this.unidades_protecao_integral['layer'] = this.createTMSLayer(this.unidades_protecao_integral.layername, this.unidades_protecao_integral.visible, this.unidades_protecao_integral.opacity, '')
		this.frigorificos['layer'] = this.createTMSLayer(this.frigorificos.layername, this.frigorificos.visible, this.frigorificos.opacity, '')
		this.regions = this.createVectorLayer();

		this.layers.push(this.pastagem['layer'])
		this.layers.push(this.pastagem_municipios['layer'])
		this.layers.push(this.estados['layer'])
		this.layers.push(this.municipios['layer'])
		this.layers.push(this.biomas['layer'])
		this.layers.push(this.terras_indigenas['layer'])
		this.layers.push(this.unidades_protecao_integral['layer'])
		this.layers.push(this.frigorificos['layer'])
		this.layers.push(this.regions);

		this.layers.push()
		this.layers = this.layers.concat(olLayers.reverse());

	}

	buttonDownload(tipo, e) {
		if(tipo == 'csv'){
			this.linkDownload = '/service/map/downloadCSV?region=year='+this.year+''+this.msFilterRegion
		}else if (tipo == 'shp'){
			//this.linkDownload = ""
			alert('Em construção');
		}
	}

	opcoesVisualizacao(e){
		if(e.value == 'areas-pastagens'){
			this.pastagem.layer.setVisible(true);
			this.pastagem_municipios.layer.setVisible(false);
			this.layerPastureShow = 'areas-pastagens';
		}else if(e.value == 'municipios-pastagens'){
			this.pastagem_municipios.layer.setVisible(true);
			this.pastagem.layer.setVisible(false);
			this.layerPastureShow = 'municipios-pastagens';
		}
	}

	private baseLayerChecked(base, e) {
		if (base == 'mapbox' && e.checked){
			this.mapbox.layer.setVisible(true);
			this.mapbox.visible = true;
			this.satelite.layer.setVisible(false);
			this.satelite.visible = false;
			this.estradas.layer.setVisible(false);
			this.estradas.visible = false;
			this.relevo.layer.setVisible(false);
			this.relevo.visible = false;
			this.landsat.layer.setVisible(false);
			this.landsat.visible = false;
		} else if (base == 'satelite' && e.checked) {
			this.satelite.layer.setVisible(true);
			this.satelite.visible = true;
			this.mapbox.layer.setVisible(false);
			this.mapbox.visible = false;
			this.estradas.layer.setVisible(false);
			this.estradas.visible = false;
			this.relevo.layer.setVisible(false);
			this.relevo.visible = false;
			this.landsat.layer.setVisible(false);
			this.landsat.visible = false;
		} else if (base == 'estradas' && e.checked) {
			this.estradas.layer.setVisible(true);
			this.estradas.visible = true;
			this.satelite.layer.setVisible(false);
			this.satelite.visible = false;
			this.mapbox.layer.setVisible(false);
			this.mapbox.visible = false;
			this.relevo.layer.setVisible(false);
			this.relevo.visible = false;
			this.landsat.layer.setVisible(false);
			this.landsat.visible = false;
		} else if ((base == 'relevo' && e.checked)) {
			this.relevo.layer.setVisible(true);
			this.relevo.visible = true;
			this.estradas.layer.setVisible(false);
			this.estradas.visible = false;
			this.satelite.layer.setVisible(false);
			this.satelite.visible = false;
			this.mapbox.layer.setVisible(false);
			this.mapbox.visible = false;
			this.landsat.layer.setVisible(false);
			this.landsat.visible = false;
		} else if ((base == 'landsat' && e.checked)) {
			this.landsat.layer.setVisible(true);
			this.landsat.visible = true;
			this.relevo.layer.setVisible(false);
			this.relevo.visible = false;
			this.estradas.layer.setVisible(false);
			this.estradas.visible = false;
			this.satelite.layer.setVisible(false);
			this.satelite.visible = false;
			this.mapbox.layer.setVisible(false);
			this.mapbox.visible = false;
		} else {
			this.mapbox.layer.setVisible(true);
			this.mapbox.visible = true;
			this.satelite.layer.setVisible(false);
			this.satelite.visible = false;
			this.estradas.layer.setVisible(false);
			this.estradas.visible = false;
			this.relevo.layer.setVisible(false);
			this.relevo.visible = false;
			this.landsat.layer.setVisible(false);
			this.landsat.visible = false;
		}

	}

	layerchecked(layer, e) {

		if (layer == this.estados.layer) {
			this.municipios.layer.setVisible(false)
			this.municipios.visible = false
			this.biomas.layer.setVisible(false)
			this.biomas.visible = false
		} else if (layer == this.municipios.layer) {
			this.estados.layer.setVisible(false)
			this.estados.visible = false
			this.biomas.layer.setVisible(false)
			this.biomas.visible = false
		} else if (layer == this.biomas.layer) {
			this.estados.layer.setVisible(false)
			this.estados.visible = false
			this.municipios.layer.setVisible(false)
			this.municipios.visible = false
		} else if (layer == this.pastagem.layer) {
				if(e.checked === false){
					this.pastagem_municipios.layer.setVisible(false);
				}else if (e.checked === true && this.layerPastureShow == 'municipios-pastagens'){
					this.pastagem_municipios.layer.setVisible(true);
				}
		}

		layer.setVisible(e.checked);

	}

	legendchecked() {
		this.checkedLegend = !this.checkedLegend;
		if (this.layerPastureShow == 'municipios-pastagens'){
			this.pastagem_municipios.layer.setVisible(this.checkedLegend);
		} else {
			this.pastagem.layer.setVisible(this.checkedLegend);
		}
	}

	updateyear() {
		this.sumIndicators();
		this.updateSourceLayer();
		this.updateChartsYears();
	}

	private sumIndicators() {
		this.http.get('/service/map/indicators?&MSFILTER=year='+this.year+''+this.msFilterRegion).subscribe(indicators => {
			this.indicator = indicators[0].sum;
		});
	}

	private updateCharts() {
		this.http.get('/service/map/charts?region='+this.msFilterRegionCharts).subscribe(charts => {
			this.chartResult = charts;
		});
	}

	private updateChartsYears() {
		this.http.get('/service/map/chartsByYear?year='+this.year+''+this.msFilterRegion).subscribe(chartsYear => {
			this.chartResultCities = chartsYear['cities'];
			this.chartResultStates = chartsYear['state'];
		});
	}

	ngOnInit() {
		this.layerLegend = "Área de Pastagem"
		this.regionSelected = 'Brasil';
		this.updateChartsYears();
		this.sumIndicators();

		this.http.get('/service/map/years').subscribe(years => {
			this.years = years;
		});

		this.http.get('/service/map/charts').subscribe(charts => {
			this.chartResult = charts;
		});

		this.createMap();
	}

}
