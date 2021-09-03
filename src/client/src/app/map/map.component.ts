/* eslint no-use-before-define: 0 */
import {Component, Injectable, OnInit, Inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { environment } from "../../environments/environment";

import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import {catchError, debounceTime, distinctUntilChanged, map, tap, switchMap} from 'rxjs/operators';
import {FormControl} from '@angular/forms';
import * as ol from 'openlayers';
import Circle from 'ol/style/circle.js';
import {Circle as CircleStyle} from 'ol/style.js';

import BingMaps from 'ol/source/bingmaps';
import TileArcGISRest from 'ol/source/tilearcgisrest';
import OlMap from 'ol/map';
import OlXYZ from 'ol/source/xyz';
import Select from 'ol/interaction/select';
import Condition from 'ol/events/condition';
import OlTileLayer from 'ol/layer/tile';
import VectorLayer from 'ol/layer/vector';
import TileGrid from 'ol/tilegrid/tilegrid';
import TileWMS from 'ol/source/tilewms';
import VectorSource from 'ol/source/vector';
import Stroke from 'ol/style/stroke';
import Image from 'ol/style/image';
import Fill from 'ol/style/fill';
import Style from 'ol/style/style';
import OlView from 'ol/view';
import OlProj from 'ol/proj';
import OlExtent from 'ol/extent';
import Overlay from 'ol/overlay';
import GeoJSON from 'ol/format/geojson';
import _ol_TileUrlFunction_ from 'ol/tileurlfunction.js';
import TileJSON from 'ol/source/tilejson.js';
import TileUTFGrid from 'ol/source/tileutfgrid';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import 'rxjs/add/observable/of';

const SEARCH_URL = 'service/map/search';
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
  env: any;
	map: OlMap;
	layers: Array<TileWMS>;
	projection: OlProj;
	tileGrid: TileGrid;
	currentZoom: Number;
	utfgridsource: TileUTFGrid;
  infoOverlay: Overlay;

	indicatorPasture: any;
	indicatorPasturePercentual: any;
	indicatorPastureDegraded: any;
	indicatorPastureDegradedPercentual: any;
	indicatorPastureOld: any;
	indicatorPastureOldPercentual;
	indicatorPotencialInt: any;
	indicatorRebanhoBovino: any;
  indicatorRebanhoBovinoPercentual: any;
	indicatorPoints: any;
	indicatorPointsNoStop: any;
	indicatorPointsTVITreinamento: any;
	indicatorPointsTVIValidacao: any;
	urls: any;
	indexedLayers: any;
	tileloading: Number;
	selectPasture = 'areas-pastagens'
  selectPastureCarbon = 'pasture_carbon_aglivc'
	selectPastureDegraded = 'areas-pastagens-degraded'
	checked = true;
  checkedPastureCarbon = false;
  checkedLegendPastureCarbon = true;
	checkedLegendPasture = true;
	checkedLegendPastureDegraded = true;
	checkedLegendFieldPointNoStop = true;
	checkedLegendTviPoint = true;
	checkedLegendRebanho = true;
	checkedLegendPot_Int = true;
  infodata: any;

	year = '2019';
  yearIndicatorLotacao = '2018'
	years: any;
	regions: any;
	fieldPointsStop: any;
	totalFotos: any;
	fotoAtual = 1;

	charts: any;
	chartResult: any;
	chartDegradationResult: any;
	chartResultStates: any;
	regionSelected: 'Brasil';
	regionTypeCharts: any;
  regionTypeBr: any;
	selectedIndex: any;
  viewWidth = 600;
  viewWidthMobile = 350;
  Usetransitions: any;
  chartResultTransitions: any;
  nameChartsTransitions: any;

	infoFeature: any;

	model: any;
  searching = false;
  searchFailed = false;
  msFilterRegion = '';
  msFilterRegionCharts = '';
  chartResultCities: any;

  downloadRegionType: any;
  downloadRegion: any;
  chartRegionScale: boolean;
  changeTabSelected: '';

  collapseLayer: boolean;
  collapseCharts: boolean;
  collapseLegends: boolean;

  layerLegend: any;
  colorScheme = {
    name: 'chartsPasture',
    selectable: true,
    group: 'Ordinal',
    domain: ['#ffc107', '#f48c40', '#a8385d', '#00bfa5']
	};
	colorSchemeDegradation = {
    domain: ['#579e4e', '#c8e88f', '#f8cd88', '#db473f']
  };
  colorSchemeDegradationStatic = {
    domain: ['#00733F', '#F8C8D2', '#D02C17']
  };
  colorSchemeTransitions: any;
  colorSchemeStates = ('solar');
  colorSchemeStatesType = ('linear');

  pastagem: any;
  pasture_carbon: any;
  pasture_carbon_aglivc: any;
  pasture_carbon_stdeadc: any;
  pasture_carbon_bglivs: any;
  pasture_carbon_somsc: any;
  pastagem_municipios: any;
  pastagens_todas_transicoes: any;
  pastagens_uma_transicao: any;
  pastagens_zero_transicao: any;
  pastagens_degradadas: any;
  pastagem_degradada_municipios: any;
  classes_degradacao_pastagem: any;
  rebanho_bovino: any;
  potencial_intensificacao: any;
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
  relevo:any;
  terras_privadas: any;
  pontos_campo_sem_parada: any;
  pontos_tvi_treinamento: any;
  pontos_tvi_validacao: any;

  dropdowPontosdeCampo = new FormControl('parada');
  dropdowPontosTVI = new FormControl('treinamento');
  tipoCampo: any;
  tipoTVI: any;
  region:any;
  regionSource: any;
  region_geom: any;
  linkDownload: any;
  layerPastureShow = 'areas-pastagens';
  // layerPastureDegradedShow = 'classes_degradacao_pastagem';
  layerPastureDegradedShow = 'pasture_quality';
  layerPointTVIShow = 'treinamento';
  layerPointFieldShow = 'parada';
  pastagem_show: any;
  layerPastureCarbonShow = 'pasture_carbon_aglivc';
  pasture_carbon_show: any;
  pastagens_degradadas_show: any;
  rebanho_bovino_show: any;
  potencial_intensificacao_show: any;
  pontos_sem_parada_show: any;
  pontos_tvi_show: any;
  show_year_pasture = true;

  baseMap = 'mapbox';
  hectares = "hectares";
  estadosCharts = "estados";

  pontos_parada = false;
	contractTypeValid = false;
	disableTransitionsPastures = true;

  loadingChartPasture = true;

  pastureDagradedYears = [2010, 2018];
  pastureDagradedYear = 2010;

  chartsDegradation = {
    2010: [
      { name: "Ausente", value: 48.8 },
      { name: "Intermediário", value: 65.0 },
      { name: "Severa", value: 53.9 }
    ],
    2018: [
      {name: "Ausente", value: 68.3},
      {name: "Intermediário", value: 53.4},
      {name: "Severa", value: 44.3}
    ]
  };

  constructor(private http: HttpClient, private _service: SearchService, public dialog: MatDialog) {
    this.env = environment;
		this.indexedLayers = {};
		this.tileloading = 0;
		this.projection = OlProj.get('EPSG:900913');
		this.currentZoom = 4;
		this.regionTypeCharts = '';
    this.regionTypeBr = 'país';
    this.model = '';
    this.infodata = { area_pasture: -1};
    this.pastagem_show = true;
		this.urls = [
      this.env.o1,
      this.env.o2,
      this.env.o3,
      this.env.o4,
    ];

		this.tileGrid = new TileGrid({
    	extent: this.projection.getExtent(),
    	resolutions: this.getResolutions(this.projection),
      tileSize: 512
    });

    this.layers = [];

    this.infoFeature = {
  		foto: ''
  	}

  	this.tipoCampo = 'parada';
  	this.tipoTVI = 'treinamento';
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

  openDialog(layer): void {
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '650px',
      data: {name: layer}
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  yearGraphic(e) {
    var yearGraphic = e.name;
    if(e.series == 'Rebanho Bovino - UA') {
      this.year = yearGraphic.toString();
      this.rebanho_bovino.layer.setVisible(true);
    }else if (e.series == 'Pastagem ha') {
      this.year = yearGraphic;
      this.rebanho_bovino.layer.setVisible(false);
      this.pastagem.layer.setVisible(true);
    }

    this.updateyear();
  }

  regionGraphic(e) {
    var regionUf = e.name;

    this.http.get("service/map/chartsByYear?year="+this.year+" AND uf='"+regionUf+"'").subscribe(chartsYear => {
      this.chartResultStates = chartsYear['state'];

      var itens = {
        item: {
          name: this.chartResultStates[0].estado,
          text: this.chartResultStates[0].estado,
          type: "estado",
          value: this.chartResultStates[0].name,
        }
      }

      this.model = {text:this.chartResultStates[0].estado};
      this.updateRegion(itens);

    });

  }

  updateRegion(region) {
    this.region = region;
  	this.regionSelected = region.item.name;
  	this.regionTypeCharts = region.item.type;
    this.regionTypeBr = region.item.type;
  	this.downloadRegionType = region.item.type;
  	this.downloadRegion = region.item.value;
  	var regionType = region.item.type;
  	var region = region.item.value;
    this.region_geom = region;

  	if(regionType == 'estado') {
  		regionType = 'uf'
  		this.downloadRegionType = 'uf';
  	}else if (regionType == 'municipio') {
  		regionType = 'cd_geocmu'
  	}else if (regionType == 'região de fronteira' && region == "MATOPIBA") {
  		regionType = 'MATOPIBA'
  		region = '1'
  		this.downloadRegionType = 'roi';
  		this.downloadRegion = 'MATOPIBA';
  		this.region_geom = 'MATOPIBA';
  	}else if (regionType == 'região de fronteira' && region == "ARCODESMAT") {
  		regionType = 'ARCODESMAT'
  		region = '1'
  		this.downloadRegionType = 'roi';
  		this.downloadRegion = 'ARCODESMAT';
  		this.region_geom = 'ARCODESMAT'
  	}

  	if (regionType == 'uf' || regionType == 'cd_geocmu' ) {
  		this.disableTransitionsPastures = false;
  	} else {
  		this.disableTransitionsPastures = true;
  	}

  	this.msFilterRegion = " AND "+regionType+"='"+region+"'";
  	this.msFilterRegionCharts = regionType+"='"+region+"'";

  	this.zoomExtent();

  	this.updateCharts();
  	this.sumIndicators();
  	this.updateSourceLayer();
  	this.updateChartsYears();
    this.updateChartsTransitions();
  	this.addPoints();
  }

  changeTab(event) {
  	this.changeTabSelected = event.tab.textLabel;

  	if(event.tab.textLabel == "Série Temporal") {
      this.viewWidth = this.viewWidth + 1;
      this.viewWidthMobile =  this.viewWidthMobile + 1;
  		this.chartRegionScale = true;
  	} else if (event.tab.textLabel == "Transições"){
      this.viewWidth = this.viewWidth + 1;
      this.viewWidthMobile =  this.viewWidthMobile + 1;
    }
  }

  private zoomExtent() {
  	var map = this.map;
  	if (this.regionTypeCharts != '') {
      // this.http.get('service/map/extent?region=text='+"'"+this.region_geom+"'").subscribe(extentResult => {
			this.http.post('service/map/extent', this.region.item).subscribe(extentResult => {
        console.log(extentResult)
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

  private updateSourceLayer() {
    const source_pastagem_area = this.pastagem.layer.getSource();
    const source_pasture_carbon_aglivc = this.pasture_carbon_aglivc.layer.getSource();
    const source_pasture_carbon_stdeadc = this.pasture_carbon_stdeadc.layer.getSource();
    const source_pasture_carbon_bglivs = this.pasture_carbon_bglivs.layer.getSource();
    const source_pasture_carbon_somsc = this.pasture_carbon_somsc.layer.getSource();
		const source_pastagem_municipio = this.pastagem_municipios.layer.getSource();
		const source_pastagens_todas_transicoes = this.pastagens_todas_transicoes.layer.getSource();
		const source_pastagens_uma_transicoes = this.pastagens_uma_transicao.layer.getSource();
		const source_pastagens_zero_transicoes = this.pastagens_zero_transicao.layer.getSource();
		const source_pastagens_degradadas = this.pastagens_degradadas.layer.getSource();
		const source_pastagens_degradadas_regions = this.pastagem_degradada_municipios.layer.getSource();
		const source_classes_degradacao_pastagem = this.classes_degradacao_pastagem.layer.getSource();
		const source_rebanho_bovino = this.rebanho_bovino.layer.getSource();
		const source_potencial_intensificacao = this.potencial_intensificacao.layer.getSource();
		const source_pontos_sem_parada = this.pontos_campo_sem_parada.layer.getSource();
		const source_pontos_tvi_treinamento = this.pontos_tvi_treinamento.layer.getSource();
		const source_pontos_tvi_validacao = this.pontos_tvi_validacao.layer.getSource();
		const source_landsat = this.landsat.layer.getSource()

		source_pastagem_area.setUrls(this.getUrls(this.pastagem.layername, this.pastagem.layerfilter))
		source_pastagem_municipio.setUrls(this.getUrls(this.pastagem_municipios.layername, this.pastagem_municipios.layerfilter))
		source_pastagens_todas_transicoes.setUrls(this.getUrls(this.pastagens_todas_transicoes.layername, this.pastagens_todas_transicoes.layerfilter))
		source_pastagens_uma_transicoes.setUrls(this.getUrls(this.pastagens_uma_transicao.layername, this.pastagens_uma_transicao.layerfilter))
		source_pastagens_zero_transicoes.setUrls(this.getUrls(this.pastagens_zero_transicao.layername, this.pastagens_zero_transicao.layerfilter))
		source_pastagens_degradadas.setUrls(this.getUrls(this.pastagens_degradadas.layername, this.pastagens_degradadas.layerfilter))
    source_pasture_carbon_aglivc.setUrls(this.getUrls(this.pasture_carbon_aglivc.layername, this.pasture_carbon_aglivc.layerfilter))
    source_pasture_carbon_stdeadc.setUrls(this.getUrls(this.pasture_carbon_stdeadc.layername, this.pasture_carbon_stdeadc.layerfilter))
    source_pasture_carbon_bglivs.setUrls(this.getUrls(this.pasture_carbon_bglivs.layername, this.pasture_carbon_bglivs.layerfilter))
    source_pasture_carbon_somsc.setUrls(this.getUrls(this.pasture_carbon_somsc.layername, this.pasture_carbon_somsc.layerfilter))
		source_pastagens_degradadas_regions.setUrls(this.getUrls(this.pastagem_degradada_municipios.layername, this.pastagem_degradada_municipios.layerfilter))
		source_classes_degradacao_pastagem.setUrls(this.getUrls(this.classes_degradacao_pastagem.layername, this.classes_degradacao_pastagem.layerfilter))
		source_rebanho_bovino.setUrls(this.getUrls(this.rebanho_bovino.layername, this.rebanho_bovino.layerfilter))
		source_potencial_intensificacao.setUrls(this.getUrls(this.potencial_intensificacao.layername, this.potencial_intensificacao.layerfilter))
		source_pontos_sem_parada.setUrls(this.getUrls(this.pontos_campo_sem_parada.layername, this.pontos_campo_sem_parada.layerfilter))
		source_pontos_tvi_treinamento.setUrls(this.getUrls(this.pontos_tvi_treinamento.layername, this.pontos_tvi_treinamento.layerfilter))
		source_pontos_tvi_validacao.setUrls(this.getUrls(this.pontos_tvi_validacao.layername, this.pontos_tvi_validacao.layerfilter))
		source_landsat.updateParams({'YEAR':this.year});

		source_pastagem_area.refresh();
    source_pasture_carbon_aglivc.refresh();
    source_pasture_carbon_stdeadc.refresh();
    source_pasture_carbon_bglivs.refresh();;
    source_pasture_carbon_somsc.refresh();
		source_pastagem_municipio.refresh();
		source_pastagens_todas_transicoes.refresh();
		source_pastagens_uma_transicoes.refresh();
		source_pastagens_zero_transicoes.refresh();
		source_pastagens_degradadas.refresh();
		source_pastagens_degradadas_regions.refresh();
		source_classes_degradacao_pastagem.refresh();
		source_rebanho_bovino.refresh();
		source_potencial_intensificacao.refresh();
		source_pontos_sem_parada.refresh();
		source_pontos_tvi_treinamento.refresh();
		source_pontos_tvi_validacao.refresh();
		source_landsat.refresh();

    if(this.utfgridsource) {
      var tileJSON = this.getTileJSON();
      this.utfgridsource.tileUrlFunction_ = _ol_TileUrlFunction_.createFromTemplates(tileJSON.grids, this.utfgridsource.tileGrid);
      this.utfgridsource.refresh();
    }
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
      this.regionTypeBr = 'país';
			this.regionSelected = 'Brasil';
			this.downloadRegionType = undefined;
  		this.downloadRegion = undefined;
  		this.disableTransitionsPastures = true;
      this.layerPointTVIShow = 'treinamento';
      this.layerPointFieldShow = 'parada';
      this.sumIndicators();
      this.updateSourceLayer();
      this.updateCharts();
      this.updateChartsYears();
      this.updateChartsTransitions();
      this.addPoints();

      // this.selectPastureDegraded = 'areas-pastagens-degraded'
      this.pastagens_todas_transicoes.layer.setVisible(false);
      this.pastagens_uma_transicao.layer.setVisible(false);

      if(this.layerPastureShow == 'pastagens-uma-transicao' || this.layerPastureShow == 'pastagens-todas-transicoes'){
  		  this.layerPastureShow = 'areas-pastagens';
        this.selectPasture = 'areas-pastagens';
        this.contractTypeValid = false;
        this.show_year_pasture = true;
        this.pastagem.layer.setVisible(true);
      }
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

	private createVectorLayer(layerName, strokeColor, width) {
    return new VectorLayer({
    	name: layerName,
      source: new VectorSource({
	    }),
	    style: [
	      new Style({
          image: new Circle({
		        radius: 4,
		        fill: new Fill({color: '#ffd5c1', width: 1}),
		        stroke: new Stroke({color: '#7b2900', width: 2})
		      })
        }),
	      new Style({
	        stroke: new Stroke({
	          color: '#dedede',
	          width: width+1
	        })
	      }),
		    new Style({
	        stroke: new Stroke({
	          color: strokeColor,
	          width: width
	        })
	      })
      ]
    });
	}

	private createMap() {
		this.createBaseLayers();
		this.createLayers();
    this.map = new OlMap({
      target: 'map',
      layers: this.layers,
      view: new OlView({
	      center: OlProj.fromLonLat([-52, -14]),
	      projection: this.projection,
	      zoom: this.currentZoom,
	    }),
	    loadTilesWhileAnimating: true,
    	loadTilesWhileInteracting: true
    });

    var style = new Style({
          image: new Circle({
		        radius: 7,
		        fill: new Fill({color: '#b8714e', width: 1}),
		        stroke: new Stroke({color: '#7b2900', width: 2})
		      })
        })

    var selectOver = new Select({
			condition: Condition.pointerMove,
			layers: [this.fieldPointsStop],
			style: style
    });

    var select = new Select({
			condition: Condition.click,
			layers: [this.fieldPointsStop],
			style: style
    });

    select.on('select', function(event) {
    	if(event.selected.length > 0) {
    		var featureSel = event.selected[0]
    		this.closeInfo = false;
    		this.totalFotos = featureSel.get('foto').length
    		this.fotoAtual = 1
	    	this.infoFeature = {
	    		id: featureSel.get('id'),
	    		foto: featureSel.get('foto'),
	    		cobertura: featureSel.get('cobertura'),
	    		obs: featureSel.get('obs'),
	    		data: featureSel.get('data'),
	    		periodo: featureSel.get('periodo'),
					horario: featureSel.get('horario'),
					altura: featureSel.get('altura'),
					homoge: featureSel.get('homoge'),
					invasoras: featureSel.get('invasoras'),
					gado: featureSel.get('gado'),
					qtd_cupins: featureSel.get('qtd_cupins'),
					forrageira: featureSel.get('forrageira'),
					solo_exp: featureSel.get('solo_exp')
	    	}
    	}
  	}.bind(this));

  	this.map.addInteraction(select);
  	this.map.addInteraction(selectOver);

    this.infoOverlay = new Overlay({
      element: document.getElementById('map-info'),
      offset: [15, 15],
      stopEvent: false
    });

    this.map.addOverlay(this.infoOverlay);

    this.map.on('pointermove', function(evt) {
      if (evt.dragging) {
        return;
      }


      var infoOverlay = this.infoOverlay;
      var coordinate = this.map.getEventCoordinate(evt.originalEvent);
      var viewResolution = this.map.getView().getResolution();

      this.utfgridsource.forDataAtCoordinateAndResolution(coordinate, viewResolution,
        function (data) {
          if(data) {
            this.infodata = data;
            this.infoOverlay.setPosition(coordinate);
          } else {
            this.infodata = { area_pasture: -1}
          }
        }.bind(this));
    }.bind(this));

	}

  private getTileJSON() {
    return {
      version: "2.1.0",
      grids: ['/service/map/info-layer?year='+this.year+'&tile={x}+{y}+{z}']
    }
  }

	public passaFoto (sentido) {

		if (sentido == 'seguinte') {
			if(this.fotoAtual < this.totalFotos) {
				this.fotoAtual = this.fotoAtual +1
			}

		} else {
			if(this.fotoAtual > 1) {
				this.fotoAtual = this.fotoAtual -1
			}
		}

	}

	private getUrls(layername, filter) {

		var result = []

		var msfilter = ""

		if(filter == 'pasture'){
			msfilter = '&MSFILTER='+"year="+this.year+''+this.msFilterRegion
		} else if(filter == 'rebanho_bovino'){
      if (this.year == '2019'){
        this.yearIndicatorLotacao = '2018';
      } else {
        this.yearIndicatorLotacao = this.year;
      }
			msfilter = '&MSFILTER='+"year="+this.year+''+this.msFilterRegion
		} else if (filter == 'pontos_campo_sem_parada' && this.msFilterRegionCharts != '') {
			msfilter = '&MSFILTER='+this.msFilterRegionCharts
		} else if (filter == 'pontos_campo_sem_parada' && this.msFilterRegionCharts == '') {
			msfilter = "&MSFILTER=uf!='0'"
		} else if (filter == 'pastagens_zero_transicao'){
			msfilter = "&MSFILTER=category='1'"+''+this.msFilterRegion
		} else if (filter == 'pasture_degraded_class' && this.msFilterRegionCharts == '') {
      msfilter = "&MSFILTER=category='1'"
    } else if (filter == 'pasture_carbon_aglivc') {
      msfilter = '&MSFILTER='+"year=2019" + this.msFilterRegion
    } else if (filter == 'pasture_carbon_stdeadc') {
      msfilter = '&MSFILTER='+"year=2019" + this.msFilterRegion
    } else if (filter == 'pasture_carbon_somsc') {
      msfilter = '&MSFILTER='+"year=2019" + this.msFilterRegion
    } else if (filter == 'pasture_carbon_bglivs') {
      msfilter = '&MSFILTER='+"year=2019" + this.msFilterRegion
    } else if (filter == 'pasture_quality') {
      msfilter = '&MSFILTER='+"year="+this.pastureDagradedYear+''+this.msFilterRegion
    }

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

		var year =

		this.mapbox = {
			visible: true,
			layer: new OlTileLayer({
	      source: new OlXYZ({
		      wrapX: false,
		      url: 'https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
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
          url: 'http://workspace.mapbiomas.org/wms',
          projection: 'EPSG:3857',
          params: {'LAYERS': 'rgb',
          					'SERVICE': 'WMS',
          					'VERSION': '1.1.1',
										'TRANSPARENT': 'true',
          					'MAP': 'wms/v/4.0/classification/rgb.map',
          					'YEAR': this.year
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
			layerfilter: 'pasture'
		}

		this.pastagem_municipios = {
			label: 'Áreas de Pastagens do Brasil',
			tooltip: 'Áreas de Pastagens do Brasil',
			layername: "pasture_regions_municipios",
			visible: false,
			opacity: 1,
			layerfilter: 'pasture'
		}

		this.pastagens_todas_transicoes = {
			label: 'Áreas de Pastagens do Brasil - Todas Transições',
			tooltip: 'Áreas de Pastagens do Brasil - Todas Transições',
			layername: "pasture_all_transitions",
			visible: false,
			opacity: 1,
			layerfilter: 'pontos_campo_sem_parada'
		}

		this.pastagens_uma_transicao = {
			label: 'Áreas de Pastagens do Brasil - Uma transição',
			tooltip: 'Áreas de Pastagens do Brasil - Uma transição',
			layername: "pasture_one_transitions",
			visible: false,
			opacity: 1,
			layerfilter: 'pontos_campo_sem_parada'
		}

		this.pastagens_zero_transicao = {
			label: 'Áreas de Pastagens do Brasil - Zero Transição',
			tooltip: 'Áreas de Pastagens do Brasil - Zero Transição',
			layername: "pasture_zero_transitions",
			visible: false,
			opacity: 1,
			layerfilter: 'pastagens_zero_transicao'
		}

		this.pastagens_degradadas = {
			label: 'Áreas de Pastagens degradadas no Brasil',
			tooltip: 'Áreas de Pastagens degradadas no Brasil',
			layername: "pasture_degraded",
			visible: false,
			opacity: 1,
			layerfilter: 'pasture_degraded_class'
		}

    this.pasture_carbon = {
      label: 'Áreas de Estoque de Carbono',
      tooltip: 'Áreas de Estoque de Carbono ',
      layername: "pasture_carbon_aglivc",
      visible: false,
      opacity: 1,
      layerfilter: 'pasture_carbon_aglivc'
    }

		this.pasture_carbon_aglivc = {
			label: 'Áreas de Estoque de Carbono Biomassa Viva',
			tooltip: 'Áreas de Estoque de Carbono Biomassa Viva',
			layername: "pasture_carbon_aglivc",
			visible: false,
			opacity: 1,
			layerfilter: 'pasture_carbon_aglivc'
		}

		this.pasture_carbon_stdeadc = {
			label: 'Áreas de Estoque de Carbono Biomassa Morta',
			tooltip: 'Áreas de Estoque de Carbono Biomassa Morta',
			layername: "pasture_carbon_stdeadc",
			visible: false,
			opacity: 1,
			layerfilter: 'pasture_carbon_stdeadc'
		}

		this.pasture_carbon_bglivs = {
			label: 'Áreas de Estoque de Carbono Raizes',
			tooltip: 'Áreas de Estoque de Carbono Raizes',
			layername: "pasture_carbon_bglivs",
			visible: false,
			opacity: 1,
			layerfilter: 'pasture_carbon_bglivs'
		}

		this.pasture_carbon_somsc = {
			label: 'Áreas de Estoque de Carbono Matéria Orgânica do Solo (SOM)',
			tooltip: 'Áreas de Estoque de Carbono Matéria Orgânica do Solo (SOM)',
			layername: "pasture_carbon_somsc",
			visible: false,
			opacity: 1,
			layerfilter: 'pasture_carbon_somsc'
		}

		this.pastagem_degradada_municipios = {
			label: 'Áreas de Pastagens degradadas do Brasil',
			tooltip: 'Áreas de Pastagens degradadas do Brasil',
			layername: "pasture_degraded_regions_municipios",
			visible: false,
			opacity: 1,
			layerfilter: 'pontos_campo_sem_parada'
		}

		this.classes_degradacao_pastagem = {
			label: 'Classes de Degradação das Pastagens no Brasil',
			tooltip: 'Classes de Degradação das Pastagens no Brasil',
			// layername: "classes_degradacao_pastagem",
			layername: "pasture_quality",
			visible: false,
			opacity: 1,
			layerfilter: 'pasture_quality'
			// layerfilter: 'pontos_campo_sem_parada'
		}

		this.rebanho_bovino = {
			label: 'Rebanho Bovino - UA',
			tooltip: 'Rebanho Bovino - UA',
			layername: "lotacao_bovina_regions",
			visible: false,
			opacity: 1,
			layerfilter: 'rebanho_bovino'
		}

		this.potencial_intensificacao = {
			label: 'Potencial de Intenficação da Pecuária',
			tooltip: 'Potencial de Intenficação da Pecuária',
			layername: "potencial_intensificacao_pecuaria",
			visible: false,
			opacity: 1,
			layerfilter: 'pontos_campo_sem_parada'
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

		this.pontos_campo_sem_parada = {
			label: 'Pontos de campo coletados de carro',
			tooltip: 'Pontos de campo coletados de carro',
			layername: "pontos_campo_sem_parada",
			visible: false,
			opacity: 1,
			layerfilter: 'pontos_campo_sem_parada'
		}

		this.pontos_tvi_treinamento = {
			label: 'Pontos Visualmente inspecionados - Treinamento',
			tooltip: 'Pontos Visualmente inspecionados - Treinamento ',
			layername: "pontos_tvi_treinamento",
			visible: false,
			opacity: 1,
			layerfilter: 'pontos_campo_sem_parada'
		}

		this.pontos_tvi_validacao = {
			label: 'Pontos Visualmente inspecionados - Validação ',
			tooltip: 'Pontos Visualmente inspecionados - Validação ',
			layername: "pontos_tvi_validacao",
			visible: false,
			opacity: 1,
			layerfilter: 'pontos_campo_sem_parada'
		}

		this.terras_privadas = {
			label: 'Terras Privadas do CAR',
			tooltip: 'Terras Privadas do CAR',
			layername: "geo_car_imovel",
			visible: false,
			opacity: 1
		}

    this.utfgridsource = new TileUTFGrid({
      tileJSON: this.getTileJSON()
    });

    var utfgridLayer = new OlTileLayer({
      source: this.utfgridsource
    });

		this.pastagem['layer'] = this.createTMSLayer(this.pastagem.layername, this.pastagem.visible, this.pastagem.opacity, this.pastagem.layerfilter);
		this.pastagem_municipios['layer'] = this.createTMSLayer(this.pastagem_municipios.layername, this.pastagem_municipios.visible, this.pastagem_municipios.opacity, this.pastagem_municipios.layerfilter);
		this.pastagens_todas_transicoes['layer'] = this.createTMSLayer(this.pastagens_todas_transicoes.layername, this.pastagens_todas_transicoes.visible, this.pastagens_todas_transicoes.opacity, this.pastagens_todas_transicoes.layerfilter);
		this.pastagens_uma_transicao['layer'] = this.createTMSLayer(this.pastagens_uma_transicao.layername, this.pastagens_uma_transicao.visible, this.pastagens_uma_transicao.opacity, this.pastagens_uma_transicao.layerfilter);
		this.pastagens_zero_transicao['layer'] = this.createTMSLayer(this.pastagens_zero_transicao.layername, this.pastagens_zero_transicao.visible, this.pastagens_zero_transicao.opacity, this.pastagens_zero_transicao.layerfilter);
		this.pastagens_degradadas['layer'] = this.createTMSLayer(this.pastagens_degradadas.layername, this.pastagens_degradadas.visible, this.pastagens_degradadas.opacity, this.pastagens_degradadas.layerfilter);
		this.pastagem_degradada_municipios['layer'] = this.createTMSLayer(this.pastagem_degradada_municipios.layername, this.pastagem_degradada_municipios.visible, this.pastagem_degradada_municipios.opacity, this.pastagem_degradada_municipios.layerfilter);
		this.classes_degradacao_pastagem['layer'] = this.createTMSLayer(this.classes_degradacao_pastagem.layername, this.classes_degradacao_pastagem.visible, this.classes_degradacao_pastagem.opacity, this.classes_degradacao_pastagem.layerfilter)
		this.rebanho_bovino['layer'] = this.createTMSLayer(this.rebanho_bovino.layername, this.rebanho_bovino.visible, this.rebanho_bovino.opacity, this.rebanho_bovino.layerfilter);
		this.potencial_intensificacao['layer'] = this.createTMSLayer(this.potencial_intensificacao.layername, this.potencial_intensificacao.visible, this.potencial_intensificacao.opacity, this.potencial_intensificacao.layerfilter);
		this.estados['layer'] = this.createTMSLayer(this.estados.layername, this.estados.visible, this.estados.opacity, '')
		this.municipios['layer'] = this.createTMSLayer(this.municipios.layername, this.municipios.visible, this.municipios.opacity, '')
		this.biomas['layer'] = this.createTMSLayer(this.biomas.layername, this.biomas.visible, this.biomas.opacity, '')
		this.terras_indigenas['layer'] = this.createTMSLayer(this.terras_indigenas.layername, this.terras_indigenas.visible, this.terras_indigenas.opacity, '')
		this.unidades_protecao_integral['layer'] = this.createTMSLayer(this.unidades_protecao_integral.layername, this.unidades_protecao_integral.visible, this.unidades_protecao_integral.opacity, '')
		this.frigorificos['layer'] = this.createTMSLayer(this.frigorificos.layername, this.frigorificos.visible, this.frigorificos.opacity, '')
		this.pontos_campo_sem_parada['layer'] = this.createTMSLayer(this.pontos_campo_sem_parada.layername, this.pontos_campo_sem_parada.visible, this.pontos_campo_sem_parada.opacity, this.pontos_campo_sem_parada.layerfilter)
		this.pontos_tvi_treinamento['layer'] = this.createTMSLayer(this.pontos_tvi_treinamento.layername, this.pontos_tvi_treinamento.visible, this.pontos_tvi_treinamento.opacity, this.pontos_tvi_treinamento.layerfilter)
		this.pontos_tvi_validacao['layer'] = this.createTMSLayer(this.pontos_tvi_validacao.layername, this.pontos_tvi_validacao.visible, this.pontos_tvi_validacao.opacity, this.pontos_tvi_validacao.layerfilter)
		this.terras_privadas['layer'] = this.createTMSLayer(this.terras_privadas.layername, this.terras_privadas.visible, this.terras_privadas.opacity, '')

    this.pasture_carbon_aglivc['layer'] = this.createTMSLayer(this.pasture_carbon_aglivc.layername, this.pasture_carbon_aglivc.visible, this.pasture_carbon_aglivc.opacity, this.pasture_carbon_aglivc.layerfilter);
    this.pasture_carbon_bglivs['layer'] = this.createTMSLayer(this.pasture_carbon_bglivs.layername, this.pasture_carbon_bglivs.visible, this.pasture_carbon_bglivs.opacity, this.pasture_carbon_bglivs.layerfilter);
    this.pasture_carbon_stdeadc['layer'] = this.createTMSLayer(this.pasture_carbon_stdeadc.layername, this.pasture_carbon_stdeadc.visible, this.pasture_carbon_stdeadc.opacity, this.pasture_carbon_stdeadc.layerfilter);
    this.pasture_carbon_somsc['layer'] = this.createTMSLayer(this.pasture_carbon_somsc.layername, this.pasture_carbon_somsc.visible, this.pasture_carbon_somsc.opacity, this.pasture_carbon_somsc.layerfilter);

		this.regions = this.createVectorLayer('regions', '#663300', 3);
		this.fieldPointsStop = this.createVectorLayer('fieldPointsStop', '#fc16ef', 3);
		this.fieldPointsStop.setVisible(false);

		this.layers.push(this.pastagem['layer'])

    this.layers.push(this.pasture_carbon_aglivc['layer'])
    this.layers.push(this.pasture_carbon_bglivs['layer'])
    this.layers.push(this.pasture_carbon_stdeadc['layer'])
    this.layers.push(this.pasture_carbon_somsc['layer'])

		this.layers.push(this.pastagem_municipios['layer'])
		this.layers.push(this.pastagens_todas_transicoes['layer'])
		this.layers.push(this.pastagens_uma_transicao['layer'])
		this.layers.push(this.pastagens_zero_transicao['layer'])
		this.layers.push(this.pastagens_degradadas['layer'])
		this.layers.push(this.pastagem_degradada_municipios['layer'])
		this.layers.push(this.classes_degradacao_pastagem['layer'])
		this.layers.push(this.rebanho_bovino['layer'])
		this.layers.push(this.potencial_intensificacao['layer'])
		this.layers.push(this.estados['layer'])
		this.layers.push(this.municipios['layer'])
		this.layers.push(this.biomas['layer'])
		this.layers.push(this.terras_indigenas['layer'])
		this.layers.push(this.unidades_protecao_integral['layer'])
		this.layers.push(this.frigorificos['layer'])
		this.layers.push(this.pontos_campo_sem_parada['layer'])
		this.layers.push(this.pontos_tvi_treinamento['layer'])
		this.layers.push(this.pontos_tvi_validacao['layer'])
		this.layers.push(this.regions);
		this.layers.push(this.fieldPointsStop);
		this.layers.push(this.terras_privadas.layer);
		this.layers.push(utfgridLayer)

		this.layers.push()
		this.layers = this.layers.concat(olLayers.reverse());

	}

	buttonDownload(tipo, layer, e) {
		if(layer == 'pasture'){
			if(tipo == 'csv') {
				var paramsDownload = 'file='+layer+'&region=year='+this.year+''+this.msFilterRegion+'&filter='+this.msFilterRegionCharts;
				this.linkDownload = 'service/map/downloadCSV?'+paramsDownload
			} else if (tipo == 'shp') {
				if (this.layerPastureShow == 'areas-pastagens') {
				var paramsDownload = 'file='+layer+'&regionType='+this.downloadRegionType+'&region='+this.downloadRegion+'&year='+this.year
				this.linkDownload = 'service/map/downloadSHP?'+paramsDownload
				} else if (this.layerPastureShow == 'municipios-pastagens') {
					var paramsDownload = '&MSFILTER=year='+this.year+''+this.msFilterRegion
					this.linkDownload = this.env.ows + '?REQUEST=GetFeature&SERVICE=wfs&VERSION=1.0.0&TYPENAME=pasture_regions_municipios&OUTPUTFORMAT=shape-zip'+paramsDownload+'&WIDTH=1&HEIGHT=1'
				} else if (this.layerPastureShow == 'pastagens-zero-transicao') {
					var paramsDownload = 'file=old_pasture&regionType='+this.downloadRegionType+'&region='+this.downloadRegion+'&year='+this.year
					this.linkDownload = 'service/map/downloadSHP?'+paramsDownload
				} else if (this.layerPastureShow == 'pastagens-todas-transicoes') {
					var paramsDownload = 'file=pasture_all_transitions&regionType='+this.downloadRegionType+'&region='+this.downloadRegion+'&year='+this.year
					this.linkDownload = 'service/map/downloadSHP?'+paramsDownload
				} else if (this.layerPastureShow == 'pastagens-uma-transicao') {
					var paramsDownload = 'file=pasture_all_transitions&regionType='+this.downloadRegionType+'&region='+this.downloadRegion+'&year='+this.year
					this.linkDownload = 'service/map/downloadSHP?'+paramsDownload
				}
			}
		} else if (tipo == 'shp' && layer == 'classes_degradacao_pastagem') {
			var paramsDownload = 'file='+layer+'&regionType='+this.downloadRegionType+'&region='+this.downloadRegion
			this.linkDownload = 'service/map/downloadSHP?'+paramsDownload
		}else if (tipo == 'csv' && layer == 'classes_degradacao_pastagem') {
				var paramsDownload = 'file='+layer+'&filter='+this.msFilterRegionCharts;
				this.linkDownload = 'service/map/downloadCSV?'+paramsDownload
		} else if(layer == 'lotacao_bovina_regions') {
        var yearRebanhoBovino;
        if(this.year == '2019') {
          yearRebanhoBovino = '2018'
        } else {
          yearRebanhoBovino = this.year
        }

			if(tipo == 'csv') {
				var paramsDownload = 'file='+layer+'&region=year='+this.year+''+this.msFilterRegion+'&filter='+this.msFilterRegionCharts;
				this.linkDownload = 'service/map/downloadCSV?'+paramsDownload
			} else {
			  var paramsDownload = '&MSFILTER=year='+this.year+''+this.msFilterRegion
        this.linkDownload = this.env.ows + '?REQUEST=GetFeature&SERVICE=wfs&VERSION=1.0.0&TYPENAME=lotacao_bovina_regions&OUTPUTFORMAT=shape-zip'+paramsDownload+'&WIDTH=1&HEIGHT=1'
      }
		} else if (layer == 'pontos_campo') {
			var paramsDownload = 'file=pontos_campo_parada';

			if (tipo == "carro") {
				paramsDownload = 'file=pontos_campo_sem_parada'
			}

			this.linkDownload = 'service/map/downloadSHP?'+paramsDownload
		} else if (layer == 'pontos_tvi') {
			var paramsDownload = 'file=pontos_tvi_treinamento';

			if (tipo == "validacao") {
				paramsDownload = 'file=pontos_tvi_validacao'
			}

			this.linkDownload = 'service/map/downloadSHP?'+paramsDownload
		} else if (layer == 'potencial_intensificacao_pecuaria') {
			if(tipo == 'csv') {
				var paramsDownload = 'file='+layer+'&filter='+this.msFilterRegionCharts;
				this.linkDownload = 'service/map/downloadCSV?'+paramsDownload;
			} else {
        var paramsDownload = 'file='+layer+'&regionType='+this.downloadRegionType+'&region='+this.downloadRegion
        this.linkDownload = 'service/map/downloadSHP?'+paramsDownload
      }
		}

	}

	opcoesVisualizacao(e){
    if(e.value == 'areas-pastagens'){
			this.pastagem.layer.setVisible(true);
			this.pastagem_municipios.layer.setVisible(false);
			this.pastagens_todas_transicoes.layer.setVisible(false);
			this.pastagens_uma_transicao.layer.setVisible(false);
			this.pastagens_zero_transicao.layer.setVisible(false);
      this.pasture_carbon_aglivc.layer.setVisible(false);
      this.pasture_carbon_bglivs.layer.setVisible(false);
      this.pasture_carbon_stdeadc.layer.setVisible(false);
      this.pasture_carbon_somsc.layer.setVisible(false);
			this.contractTypeValid = false;
			this.layerPastureShow = 'areas-pastagens';
			this.show_year_pasture = true;
		} else if (e.value == 'municipios-pastagens') {
			this.pastagem_municipios.layer.setVisible(true);
			this.pastagem.layer.setVisible(false);
			this.pastagens_todas_transicoes.layer.setVisible(false);
			this.pastagens_uma_transicao.layer.setVisible(false);
			this.pastagens_zero_transicao.layer.setVisible(false);
      this.pasture_carbon_aglivc.layer.setVisible(false);
      this.pasture_carbon_bglivs.layer.setVisible(false);
      this.pasture_carbon_stdeadc.layer.setVisible(false);
      this.pasture_carbon_somsc.layer.setVisible(false);
			this.contractTypeValid = false;
			this.layerPastureShow = 'municipios-pastagens';
			this.show_year_pasture = true;
		} else if (e.value == 'pastagens-todas-transicoes') {
			this.pastagens_todas_transicoes.layer.setVisible(true);
			this.pastagens_uma_transicao.layer.setVisible(false);
			this.pastagens_zero_transicao.layer.setVisible(false);
			this.pastagem_municipios.layer.setVisible(false);
      this.pasture_carbon_aglivc.layer.setVisible(false);
      this.pasture_carbon_bglivs.layer.setVisible(false);
      this.pasture_carbon_stdeadc.layer.setVisible(false);
      this.pasture_carbon_somsc.layer.setVisible(false);
			this.pastagem.layer.setVisible(false);
			this.contractTypeValid = true;
			this.layerPastureShow = 'pastagens-todas-transicoes';
			this.show_year_pasture = false;
      this.selectedIndex = 2;
		} else if (e.value == 'pastagens-uma-transicao') {
			this.pastagens_uma_transicao.layer.setVisible(true);
			this.pastagens_zero_transicao.layer.setVisible(false);
			this.pastagens_todas_transicoes.layer.setVisible(false);
			this.pastagem_municipios.layer.setVisible(false);
      this.pasture_carbon_aglivc.layer.setVisible(false);
      this.pasture_carbon_bglivs.layer.setVisible(false);
      this.pasture_carbon_stdeadc.layer.setVisible(false);
      this.pasture_carbon_somsc.layer.setVisible(false);
			this.pastagem.layer.setVisible(false);
			this.contractTypeValid = true;
			this.layerPastureShow = 'pastagens-uma-transicao';
			this.show_year_pasture = false;
      this.selectedIndex = 2;
		} else if (e.value == 'pasture_carbon_aglivc') {
			this.pastagens_zero_transicao.layer.setVisible(false);
			this.pastagens_uma_transicao.layer.setVisible(false);
			this.pastagens_todas_transicoes.layer.setVisible(false);
			this.pastagem_municipios.layer.setVisible(false);
      this.pasture_carbon_aglivc.layer.setVisible(true);
      this.pasture_carbon_bglivs.layer.setVisible(false);
      this.pasture_carbon_stdeadc.layer.setVisible(false);
      this.pasture_carbon_somsc.layer.setVisible(false);
			this.pastagem.layer.setVisible(false);
			this.layerPastureCarbonShow= 'pasture_carbon_aglivc';
		} else if (e.value == 'pasture_carbon_stdeadc') {
			this.pastagens_zero_transicao.layer.setVisible(false);
			this.pastagens_uma_transicao.layer.setVisible(false);
			this.pastagens_todas_transicoes.layer.setVisible(false);
			this.pastagem_municipios.layer.setVisible(false);
      this.pasture_carbon_aglivc.layer.setVisible(false);
      this.pasture_carbon_bglivs.layer.setVisible(false);
      this.pasture_carbon_stdeadc.layer.setVisible(true);
      this.pasture_carbon_somsc.layer.setVisible(false);
			this.pastagem.layer.setVisible(false);
			this.layerPastureCarbonShow = 'pasture_carbon_stdeadc';
		} else if (e.value == 'pasture_carbon_somsc') {
			this.pastagens_zero_transicao.layer.setVisible(false);
			this.pastagens_uma_transicao.layer.setVisible(false);
			this.pastagens_todas_transicoes.layer.setVisible(false);
			this.pastagem_municipios.layer.setVisible(false);
      this.pasture_carbon_aglivc.layer.setVisible(false);
      this.pasture_carbon_bglivs.layer.setVisible(false);
      this.pasture_carbon_stdeadc.layer.setVisible(false);
      this.pasture_carbon_somsc.layer.setVisible(true);
			this.pastagem.layer.setVisible(false);
			this.layerPastureCarbonShow = 'pasture_carbon_somsc';

		} else if (e.value == 'pasture_carbon_bglivs') {
			this.pastagens_zero_transicao.layer.setVisible(false);
			this.pastagens_uma_transicao.layer.setVisible(false);
			this.pastagens_todas_transicoes.layer.setVisible(false);
			this.pastagem_municipios.layer.setVisible(false);
      this.pasture_carbon_aglivc.layer.setVisible(false);
      this.pasture_carbon_bglivs.layer.setVisible(true);
      this.pasture_carbon_stdeadc.layer.setVisible(false);
      this.pasture_carbon_somsc.layer.setVisible(false);
			this.pastagem.layer.setVisible(false);
			this.layerPastureCarbonShow = 'pasture_carbon_bglivs';
		}

    this.updateChartsTransitions();

		// if(e.value == 'areas-pastagens-degraded'){
		// 	this.pastagens_degradadas.layer.setVisible(true);
		// 	this.pastagem_degradada_municipios.layer.setVisible(false);
		// 	this.classes_degradacao_pastagem.layer.setVisible(false);
		// 	this.layerPastureDegradedShow = 'areas-pastagens-degraded';
		// } else if (e.value == 'municipios-pastagens-degraded') {
		// 	this.pastagem_degradada_municipios.layer.setVisible(true);
		// 	this.pastagens_degradadas.layer.setVisible(false);
		// 	this.classes_degradacao_pastagem.layer.setVisible(false);
		// 	this.layerPastureDegradedShow = 'municipios-pastagens-degraded';
		// } else if (e.value == 'classes_degradacao_pastagem') {
		// 	this.classes_degradacao_pastagem.layer.setVisible(true);
		// 	this.pastagem_degradada_municipios.layer.setVisible(false);
		// 	this.pastagens_degradadas.layer.setVisible(false);
		// 	this.layerPastureDegradedShow = 'classes_degradacao_pastagem';
		// }

	}

	baseLayerChecked(base, e) {
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

	tipoCampoSelected(tipo, e) {

		if(tipo == 'campo') {
			this.tipoCampo = e.value
			if(this.tipoCampo == 'carro') {
				this.pontos_sem_parada_show = true;
				this.fieldPointsStop.setVisible(false)
				this.pontos_campo_sem_parada.layer.setVisible(true)
        this.layerPointFieldShow = 'carro'
			} else {
				this.pontos_sem_parada_show = false;
				this.fieldPointsStop.setVisible(true)
				this.pontos_campo_sem_parada.layer.setVisible(false)
        this.layerPointFieldShow = 'parada'
			}
		} else {
			this.tipoTVI = e.value
			if(this.tipoTVI == 'treinamento') {
				this.pontos_tvi_treinamento.layer.setVisible(true)
				this.pontos_tvi_validacao.layer.setVisible(false)
				this.layerPointTVIShow = 'treinamento'
			} else {
				this.pontos_tvi_validacao.layer.setVisible(true)
				this.pontos_tvi_treinamento.layer.setVisible(false)
				this.layerPointTVIShow = 'validacao'
			}
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
		} else if (layer == this.pasture_carbon.layer) {
      if(e.checked === false){

        this.pasture_carbon_aglivc.layer.setVisible(false);
        this.pasture_carbon_bglivs.layer.setVisible(false);
        this.pasture_carbon_stdeadc.layer.setVisible(false);
        this.pasture_carbon_somsc.layer.setVisible(false);

      } else if (e.checked === true && this.layerPastureCarbonShow == 'pasture_carbon_aglivc'){
        this.pasture_carbon_aglivc.layer.setVisible(true);
      } else if (e.checked === true && this.layerPastureCarbonShow == 'pasture_carbon_bglivs'){
        this.pasture_carbon_bglivs.layer.setVisible(true);
      } else if (e.checked === true && this.layerPastureCarbonShow == 'pasture_carbon_stdeadc'){
        this.pasture_carbon_stdeadc.layer.setVisible(true);
      } else if (e.checked === true && this.layerPastureCarbonShow == 'pasture_carbon_somsc'){
        this.pasture_carbon_somsc.layer.setVisible(true);
      }
      this.pasture_carbon_show = e.checked;
    } else if (layer == this.pastagem.layer) {
			if(e.checked === false){
				this.pastagem_municipios.layer.setVisible(false);
        this.pastagens_zero_transicao.layer.setVisible(false);
        this.pastagens_todas_transicoes.layer.setVisible(false);
        this.pastagens_uma_transicao.layer.setVisible(false);
			} else if (e.checked === true && this.layerPastureShow == 'municipios-pastagens'){
				this.pastagem_municipios.layer.setVisible(true);
			} else if (e.checked === true && this.layerPastureShow == 'pastagens-zero-transicao'){
        this.pastagens_zero_transicao.layer.setVisible(true);
      } else if (e.checked === true && this.layerPastureShow == 'pastagens-todas-transicoes'){
        this.pastagens_todas_transicoes.layer.setVisible(true);
      } else if (e.checked === true && this.layerPastureShow == 'pastagens-uma-transicao'){
        this.pastagens_uma_transicao.layer.setVisible(true);
      }
      this.pastagem_show = e.checked;
		} else if (layer == 'pontos_campo_parada') {
      console.log(this.layerPointFieldShow)
      if (this.layerPointFieldShow == 'parada') {
			  layer = this.fieldPointsStop;
      } else {
        layer = this.pontos_campo_sem_parada.layer;
      }
			this.pontos_parada = e.checked;
			this.selectedIndex = 4
		} else if (layer == 'pasture_quality') {

    // } else if (layer == 'classes_degradacao_pastagem') {

			// if(this.layerPastureDegradedShow == 'areas-pastagens-degraded'){
			// 	layer = this.pastagens_degradadas.layer;
			// } else if (this.layerPastureDegradedShow == 'municipios-pastagens-degraded') {
			// 	layer = this.pastagem_degradada_municipios.layer;
			// } else if (this.layerPastureDegradedShow == 'classes_degradacao_pastagem') {
			// 	layer = this.classes_degradacao_pastagem.layer;
			// }
			// this.pastagens_degradadas_show = e.checked;
			layer = this.classes_degradacao_pastagem.layer;
			this.pastagens_degradadas_show = e.checked;
		} else if (layer == 'rebanho_bovino') {
			layer = this.rebanho_bovino.layer;
			this.rebanho_bovino_show = e.checked;
		} else if (layer == 'potencial_intensificacao') {
			layer = this.potencial_intensificacao.layer;
			this.potencial_intensificacao_show = e.checked;
		} else if (layer == 'pontos_tvi') {
			this.pontos_tvi_show = e.checked
			if(this.layerPointTVIShow == 'validacao'){
				layer = this.pontos_tvi_validacao.layer;
			} else {
				layer = this.pontos_tvi_treinamento.layer;
			}
		}
		if(layer){
      layer.setVisible(e.checked);
    }
	}

	legendchecked(layer) {

		if (layer == 'pasture') {
			this.checkedLegendPasture = !this.checkedLegendPasture;
			if (this.layerPastureShow == 'municipios-pastagens'){
				this.pastagem_municipios.layer.setVisible(this.checkedLegendPasture);
			} else if (this.layerPastureShow == 'areas-pastagens') {
				this.pastagem.layer.setVisible(this.checkedLegendPasture);
			} else if (this.layerPastureShow == 'pastagens-todas-transicoes') {
				this.pastagens_todas_transicoes.layer.setVisible(this.checkedLegendPasture);
			} else if (this.layerPastureShow == 'pastagens-uma-transicao') {
				this.pastagens_uma_transicao.layer.setVisible(this.checkedLegendPasture);
			} else if (this.layerPastureShow == 'pastagens-zero-transicao') {
				this.pastagens_zero_transicao.layer.setVisible(this.checkedLegendPasture);
			}
		}
    if (layer == 'pasture_carbon') {
      this.checkedLegendPastureCarbon = !this.checkedLegendPastureCarbon;
      if (this.layerPastureCarbonShow == 'pasture_carbon_aglivc'){
        this.pasture_carbon_aglivc.layer.setVisible(this.checkedLegendPastureCarbon);
      } else if (this.layerPastureCarbonShow == 'pasture_carbon_bglivs') {
        this.pasture_carbon_bglivs.layer.setVisible(this.checkedLegendPastureCarbon);
      } else if (this.layerPastureCarbonShow == 'pasture_carbon_stdeadc') {
        this.pasture_carbon_stdeadc.layer.setVisible(this.checkedLegendPastureCarbon);
      } else if (this.layerPastureCarbonShow == 'pasture_carbon_somsc') {
        this.pasture_carbon_somsc.layer.setVisible(this.checkedLegendPastureCarbon);
      }
    }
		// else if (layer == 'pasture_degraded') {
		// 	this.checkedLegendPastureDegraded = !this.checkedLegendPastureDegraded;
		// 	if (this.layerPastureDegradedShow == 'areas-pastagens-degraded'){
		// 		this.pastagens_degradadas.layer.setVisible(this.checkedLegendPastureDegraded);
		// 	} else if (this.layerPastureDegradedShow == 'municipios-pastagens-degraded') {
		// 		this.pastagem_degradada_municipios.layer.setVisible(this.checkedLegendPastureDegraded);
		// 	}else if (this.layerPastureDegradedShow == 'classes_degradacao_pastagem') {
		// 		this.classes_degradacao_pastagem.layer.setVisible(this.checkedLegendPastureDegraded);
		// 	}
		// }
    // else if (this.layerPastureDegradedShow == 'classes_degradacao_pastagem') {
		else if (this.layerPastureDegradedShow == 'pasture_quality') {
			this.checkedLegendPastureDegraded = !this.checkedLegendPastureDegraded;
			this.classes_degradacao_pastagem.layer.setVisible(this.checkedLegendPastureDegraded);
		} else if (layer == 'rebanho_bovino') {
			this.checkedLegendRebanho = !this.checkedLegendRebanho;
			this.rebanho_bovino.layer.setVisible(this.checkedLegendRebanho);
		} else if (layer == 'potencial_intensificacao') {
			this.checkedLegendPot_Int = !this.checkedLegendPot_Int;
			this.potencial_intensificacao.layer.setVisible(this.checkedLegendPot_Int);
		} else if (layer == 'pontos_campo_sem_parada') {
			this.checkedLegendFieldPointNoStop = !this.checkedLegendFieldPointNoStop;
			this.pontos_campo_sem_parada.layer.setVisible(this.checkedLegendFieldPointNoStop);
		} else if (layer == 'pontos_tvi') {
			this.checkedLegendTviPoint = !this.checkedLegendTviPoint;
			if (this.layerPointTVIShow == 'validacao') {
				this.pontos_tvi_validacao.layer.setVisible(this.checkedLegendTviPoint);
			} else {
				this.pontos_tvi_treinamento.layer.setVisible(this.checkedLegendTviPoint);
			}
		}
	}

	updateyear() {
		this.sumIndicators();
		this.updateSourceLayer();
		this.updateChartsYears();
	}

  updateChartPastureDegraded(){
    this.chartDegradationResult = this.chartsDegradation[this.pastureDagradedYear];
    this.updateSourceLayer();
  }

	private sumIndicators() {

    if (this.regionTypeCharts == '') {
      this.http.get("service/map/indicatorsPastureBreBiomas?&MSFILTER=year="+this.year+" AND type = 'country'&region="+this.msFilterRegionCharts).subscribe(indicatorsPasture => {
        this.indicatorPasture = indicatorsPasture[0].area_ha;
        this.indicatorPasturePercentual = indicatorsPasture[1].percentual_area_ha;
      });
    } else if (this.regionTypeCharts == 'bioma') {
      var bioma = this.regionSelected.toUpperCase();
      this.http.get("service/map/indicatorsPastureBreBiomas?&MSFILTER=year="+this.year+" AND name = '"+bioma+"'&region="+this.msFilterRegionCharts).subscribe(indicatorsPasture => {
        this.indicatorPasture = indicatorsPasture[0].area_ha;
        this.indicatorPasturePercentual = indicatorsPasture[1].percentual_area_ha;
      });
    } else {
      this.http.get('service/map/indicators?&MSFILTER=year='+this.year+''+this.msFilterRegion).subscribe(indicatorsPasture => {
        this.indicatorPasture = indicatorsPasture[0].area_ha;
        this.indicatorPasturePercentual = indicatorsPasture[1].percentual_area_ha;
      });
    }
    //TODO Verificar ano do último dado do rebanho bovino
    if (this.year == '2019' || this.year == '2020'){
      this.yearIndicatorLotacao = '2018';
    } else {
      this.yearIndicatorLotacao = this.year;
    }

		this.http.get('service/map/indicatorsRebanhoBovino?&MSFILTER=year='+this.yearIndicatorLotacao+''+this.msFilterRegion+'&region='+this.regionTypeCharts).subscribe(indicatorsRebanho => {
			this.indicatorRebanhoBovino = indicatorsRebanho[0].ua;
      this.indicatorRebanhoBovinoPercentual = indicatorsRebanho[0].ua/indicatorsRebanho[0].past_ha
		});

		var filterPastureDegraded = 'service/map/indicatorsPastureDegraded?&MSFILTER=year='+this.pastureDagradedYear+''+this.msFilterRegionCharts
		var filterPastureOld = 'service/map/indicatorsPastureOld?&MSFILTER='+this.msFilterRegionCharts
		var filterPotencialIntensificacao = 'service/map/indicatorsPotencialIntensificacao?&MSFILTER='+this.msFilterRegionCharts
		var filterPoints = 'service/map/indicatorsPoints?&MSFILTER='+this.msFilterRegionCharts
		var filterPointsNoStop = 'service/map/indicatorsPointsNoStop?&MSFILTER='+this.msFilterRegionCharts
		var filterPointsTVITreinamento = 'service/map/indicatorsPointsTVITreinamento?&MSFILTER='+this.msFilterRegionCharts
		var filterPointsTVIValidacao = 'service/map/indicatorsPointsTVIValidacao?&MSFILTER='+this.msFilterRegionCharts

		if(this.msFilterRegionCharts == ''){
			filterPastureDegraded = 'service/map/indicatorsPastureDegraded'
			filterPastureOld = 'service/map/indicatorsPastureOld'
			filterPotencialIntensificacao = 'service/map/indicatorsPotencialIntensificacao'
			filterPoints = 'service/map/indicatorsPoints'
			filterPointsNoStop = 'service/map/indicatorsPointsNoStop'
			filterPointsTVITreinamento = 'service/map/indicatorsPointsTVITreinamento'
			filterPointsTVIValidacao = 'service/map/indicatorsPointsTVIValidacao'
		}

		this.http.get(filterPastureDegraded).subscribe(indicatorsPastureDegraded => {
      console.log('indicatorsPastureDegraded', indicatorsPastureDegraded)
			this.indicatorPastureDegraded = indicatorsPastureDegraded[0].sum;
			this.indicatorPastureDegradedPercentual = indicatorsPastureDegraded[1].percentual_area_ha;
		});

		this.http.get(filterPastureOld).subscribe(indicatorsPastureOld => {
			this.indicatorPastureOld = indicatorsPastureOld[0].sum;
			this.indicatorPastureOldPercentual = indicatorsPastureOld[1].percentual_area_ha;
		});


		this.http.get(filterPotencialIntensificacao).subscribe(indicatorsPotInt => {
			this.indicatorPotencialInt = indicatorsPotInt[0].avg;
		});

		this.http.get(filterPoints).subscribe(indicatorsPoints => {
			this.indicatorPoints = indicatorsPoints[0].count;
		});

		this.http.get(filterPointsNoStop).subscribe(indicatorsPoints => {
			this.indicatorPointsNoStop = indicatorsPoints[0].count;
		});

		this.http.get(filterPointsTVITreinamento).subscribe(indicatorsPointsTVI => {
			this.indicatorPointsTVITreinamento = indicatorsPointsTVI[0].count;
		});

		this.http.get(filterPointsTVIValidacao).subscribe(indicatorsPointsTVI => {
			this.indicatorPointsTVIValidacao = indicatorsPointsTVI[0].count;
		});
	}

	private updateCharts() {
    this.loadingChartPasture = false
		this.http.get('service/map/charts?region='+this.msFilterRegionCharts+'&type='+this.regionTypeCharts).subscribe(charts => {
      this.chartResult = null;

      let pastureSeries = [];
      let series = charts[0].series;
      series.forEach(data => {
        if(data.value != null){
          data.name = String(data.name)
          data.value = parseInt(data.value)
          data.year = String(data.year)
          pastureSeries.push(data)
        }
      });
      charts[0].series = pastureSeries;

      this.chartResult = charts;
      this.loadingChartPasture = true
		});

		// this.http.get('service/map/ChartsClassDegradation?region='+this.msFilterRegionCharts).subscribe(chartsDegradation => {
    //   console.log(chartsDegradation)
		// 	this.chartDegradationResult = chartsDegradation;
		// });
	}

	private updateChartsYears() {

		this.http.get('service/map/chartsByYear?year='+this.year+''+this.msFilterRegion+'&layer='+this.layerPastureShow).subscribe(chartsYear => {
			this.chartResultCities = chartsYear['cities'];
			this.chartResultStates = chartsYear['state'];
		});
	}

  private updateChartsTransitions() {
    if(this.layerPastureShow == 'pastagens-todas-transicoes' || this.layerPastureShow == 'pastagens-uma-transicao') {
      this.Usetransitions = true;
    } else {
      this.Usetransitions = false;
    }

    this.http.get('service/map/ChartsTransitions?region='+this.msFilterRegionCharts+'&layer='+this.layerPastureShow).subscribe(chartsTrans => {
      if(this.layerPastureShow == 'pastagens-todas-transicoes') {
        this.chartResultTransitions = chartsTrans['all'];
        this.nameChartsTransitions = "Todas transições de uso das pastagens (1985 - 2017)"
        this.colorSchemeTransitions = {
          name: 'chartsTransitions',
          selectable: true,
          group: 'Ordinal',
          domain: ['#583212', '#cb1f30', '#edc346', '#ff8fe3', '#59fd59', '#bebebe']
        };

      } else {
        this.chartResultTransitions = chartsTrans['one'];
        this.nameChartsTransitions = "Apenas uma transição de uso das pastagens (1985 - 2017)"
        this.colorSchemeTransitions = {
          name: 'chartsTransitions',
          selectable: true,
          group: 'Ordinal',
          domain: ['#bf7112', '#ffdf13', '#9cff13', '#ff1e13', '#1326ff', '#5afbd8']
        };
      }
    });

  }

	addPoints() {
		var msfilter = "?msfilter=uf!='0'";
		if (this.msFilterRegionCharts) {
			msfilter = '?msfilter='+this.msFilterRegionCharts;
		}
		var fieldValidationUrl = 'service/map/fieldPoints'+msfilter;

		this.http.get(fieldValidationUrl).subscribe(fieldValResult => {
			var features = (new GeoJSON()).readFeatures(fieldValResult, {
			  dataProjection : 'EPSG:4326',
			  featureProjection: 'EPSG:3857'
			});
			this.regionSource = this.fieldPointsStop.getSource();
			this.regionSource.clear()
			this.regionSource.addFeatures(features)
		})
	}
  formatValue(value){
    console.log(value.toFixed(2))
    return value.toFixed(2)
  }

	ngOnInit() {
		this.layerLegend = "Área de Pastagem"
		this.regionSelected = 'Brasil';
		this.updateCharts();
		this.updateChartsYears();
		this.sumIndicators();
		this.chartRegionScale = true;
    this.chartDegradationResult = this.chartsDegradation[this.pastureDagradedYear];

		this.http.get('service/map/years').subscribe(years => {
			this.years = years;
		});
    this.loadingChartPasture = false;
		this.http.get('service/map/charts').subscribe(charts => {
      this.chartResult = null;

      let pastureSeries = [];
      let series = charts[0].series;
      series.forEach(data => {
        if(data.value != null){
          data.name = String(data.name)
          data.value = parseInt(data.value)
          data.year = String(data.year)
          pastureSeries.push(data)
        }
      });
      charts[0].series = pastureSeries;
			this.chartResult = charts;
      console.log(this.chartResult)
      this.loadingChartPasture = true;
    });

		this.createMap();
		this.addPoints();
	}

}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'dialog-overview-example-dialog.html',
})

export class DialogOverviewExampleDialog {

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
