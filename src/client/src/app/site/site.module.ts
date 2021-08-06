import { NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteRoutingModule } from './site-routing.module';
import { IndexComponent } from './pages/index/index.component';
import { BaseComponent } from "./pages/base/base.component";
import { FormsModule } from "@angular/forms";
import { SobreComponent } from './pages/sobre/sobre.component';
import { ArtigosComponent } from './pages/artigos/artigos.component';
import { MetodosComponent } from './pages/metodos/metodos.component';

@NgModule({
  imports: [
    CommonModule,
    SiteRoutingModule,
    FormsModule
  ],
  declarations: [IndexComponent, BaseComponent, SobreComponent, ArtigosComponent, MetodosComponent]
})
export class SiteModule {
}
