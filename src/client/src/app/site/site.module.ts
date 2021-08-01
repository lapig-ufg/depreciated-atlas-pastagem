import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SiteRoutingModule } from './site-routing.module';
import { IndexComponent } from './pages/index/index.component';

@NgModule({
  imports: [
    CommonModule,
    SiteRoutingModule
  ],
  declarations: [IndexComponent]
})
export class SiteModule { }
