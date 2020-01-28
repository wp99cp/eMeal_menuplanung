import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InfoPageComponent } from './info-page/info-page.component';
import { InformationspageComponent } from './help-page/informations-page.component';


const routes: Routes = [

  {
    path: '',
    component: InfoPageComponent
  },
  {
    path: 'infos',
    component: InformationspageComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InformationsRoutingModule {



}
