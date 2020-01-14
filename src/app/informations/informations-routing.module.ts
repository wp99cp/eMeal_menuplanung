import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InfoPageComponent } from './info-page/info-page.component';
import { HelpPageComponent } from './help-page/help-page.component';


const routes: Routes = [

  {
    path: '',
    component: InfoPageComponent
  },
  {
    path: 'help',
    component: HelpPageComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InformationsRoutingModule {



}
