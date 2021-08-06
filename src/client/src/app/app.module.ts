import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule, MatSelectModule, MatButtonModule, MatIconModule, MatRadioModule } from '@angular/material';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material';
import { MatInputModule } from '@angular/material';


import { AppComponent } from './app.component';
import { MapComponent, DialogOverviewExampleDialog } from './map/map.component';
import { MapMobileComponent } from './map/map-mobile.component';
import { AppNavbarComponent } from './app-navbar/app-navbar.component';
import { ErrorComponent } from "./site/pages/error/error.component";


import { NgxChartsModule } from '@swimlane/ngx-charts';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);


const appRoutes: Routes = [
  {
    path: '',
    loadChildren: './site/site.module#SiteModule',
  },
  {
    path: 'map',
    component: MapComponent
  },
  {
    path: 'map-mobile',
    component: MapMobileComponent,
  },
  { path: '**',
    component: ErrorComponent,
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
    ErrorComponent,
    DialogOverviewExampleDialog
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
    MatTooltipModule,
    MatDialogModule,
    MatInputModule,
    MatProgressSpinnerModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    ),
    NgbModule.forRoot(),
  ],
  entryComponents:[DialogOverviewExampleDialog],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  public constructor(private router: Router) {
    if (window.innerWidth < 768) {
      router.resetConfig(appMobileRoutes);
    }

  }

}
