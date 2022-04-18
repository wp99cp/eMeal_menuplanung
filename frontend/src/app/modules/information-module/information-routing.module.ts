import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DatenschutzComponent} from './pages/datenschutz-page/datenschutz.component';
import {InformationspageComponent} from './pages/informations-page/informations-page.component';
import {ImpressumComponent} from './pages/impressum-page/impressum.component';
import {KontaktComponent} from './pages/kontakt-page/kontakt.component';
import {ChangeLogComponent} from './pages/change-log-page/change-log.component';
import {HelpComponent} from './pages/help-page/help.component';

const routes: Routes = [

  {
    path: '',
    redirectTo: 'eMeal',
    pathMatch: 'full'
  },
  {
    path: 'eMeal',
    component: InformationspageComponent
  },
  {
    path: 'changeLog',
    component: ChangeLogComponent
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
  },
  {
    path: 'hilfe',
    component: HelpComponent
  }


];


@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class InformationRoutingModule {


}
