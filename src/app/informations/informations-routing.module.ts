import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { DatenschutzComponent } from './datenschutz/datenschutz.component';
import { InformationspageComponent } from './help-page/informations-page.component';
import { ImpressumComponent } from './impressum/impressum.component';
import { InfoPageComponent } from './info-page/info-page.component';
import { KontaktComponent } from './kontakt/kontakt.component';

const routes: Routes = [

  {
    path: '',
    component: InfoPageComponent
  },
  {
    path: 'infos',
    component: InformationspageComponent
  },
  {
    path: 'impressum',
    component: ImpressumComponent
  },
  {
    path: 'datenschutz',
    component: DatenschutzComponent
  },
  {
    path: 'kontakt',
    component: KontaktComponent
  }

];


@NgModule({
  imports: [RouterModule.forChild(routes),
  MarkdownModule.forChild()
  ],
  exports: [RouterModule]
})
export class InformationsRoutingModule {



}
