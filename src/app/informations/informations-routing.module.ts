import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { DatenschutzComponent } from './datenschutz/datenschutz.component';
import { InformationspageComponent } from './informations-page/informations-page.component';
import { ImpressumComponent } from './impressum/impressum.component';
import { KontaktComponent } from './kontakt/kontakt.component';
import { ChangeLogComponent } from './change-log/change-log.component';
import { HelpComponent } from './help/help.component';
import {SignInComponent} from "../sign-in/sign-in.component";

const routes: Routes = [

  {
    path: '',
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
    RouterModule.forChild(routes),
    MarkdownModule.forChild()
  ],
  exports: [RouterModule]
})
export class InformationsRoutingModule {



}
