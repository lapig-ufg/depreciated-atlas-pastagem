import { NgModule } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCheckboxModule, MatSelectModule, MatButtonModule, MatIconModule, MatRadioModule } from '@angular/material';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { MapMobileComponent } from './map/map-mobile.component';
import { AppNavbarComponent } from './app-navbar/app-navbar.component';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);


const appRoutes: Routes = [
  {
    path: 'map',
    component: MapComponent
  },
  {
    path: 'map-mobile',
    component: MapMobileComponent,
  },
  { path: '',
    redirectTo: '/map',
    pathMatch: 'full'
  }
];

const appMobileRoutes: Routes = [
  {
    path: 'map',
    component: MapComponent
  },
  {
    path: 'map-mobile',
    component: MapMobileComponent,
  },
  { path: '',
    redirectTo: '/map-mobile',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    MapMobileComponent,
    AppNavbarComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    NgxChartsModule,
    MatCheckboxModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatTabsModule,
    MatTableModule,
    MatExpansionModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatSidenavModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    NgbModule.forRoot()
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
  public constructor(private router: Router) {

    console.log(window.innerWidth)
    if (window.innerWidth < 768) {
      router.resetConfig(appMobileRoutes);
    }

  }

}
