import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WelcomPageComponent } from './welcom-page/welcom-page.component';
import { CampListPageComponent } from './camp-list-page/camp-list-page.component';


const routes: Routes = [

  {
    path: 'welcom',
    component: WelcomPageComponent
  },
  {
    path: '',
    component: CampListPageComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApplicationRoutingModule { }
