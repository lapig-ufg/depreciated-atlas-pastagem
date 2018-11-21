import {Component, Injectable, OnInit} from '@angular/core';
import { SearchService, MapComponent } from './map.component';


import {map} from 'rxjs/operators';
import {HttpClient, HttpParams} from '@angular/common/http';
import { of } from 'rxjs/observable/of';

@Component({
	selector: 'app-map-mobile',
	templateUrl: 'map-mobile.component.html',
	providers: [SearchService],
	styleUrls: [
		'./map-mobile.component.css'
	]
})

export class MapMobileComponent extends MapComponent {

}