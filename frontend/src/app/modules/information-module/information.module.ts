import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MarkdownModule} from 'ngx-markdown';
import {DatenschutzComponent} from './pages/datenschutz-page/datenschutz.component';
import {InformationspageComponent} from './pages/informations-page/informations-page.component';
import {ImpressumComponent} from './pages/impressum-page/impressum.component';
import {InformationRoutingModule} from './information-routing.module';
import {KontaktComponent} from './pages/kontakt-page/kontakt.component';
import {ChangeLogComponent} from './pages/change-log-page/change-log.component';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {MatExpansionModule} from '@angular/material/expansion';
import {HelpComponent} from './pages/help-page/help.component';
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {VersionHistoryModule} from "../change-log-module/version-history.module";
import {DownloadModule} from "../download-module/download.module";


@NgModule({
  imports: [
    CommonModule,
    InformationRoutingModule,
    VersionHistoryModule,
    // mat design
    MatButtonModule,
    MatCardModule,
    MarkdownModule,
    MatExpansionModule,
    MatProgressBarModule,
    DownloadModule
  ],
  declarations: [
    InformationspageComponent,
    ImpressumComponent,
    DatenschutzComponent,
    KontaktComponent,
    ChangeLogComponent,
    HelpComponent
  ],
  providers: [
    AngularFirestore
  ]
})
export class InformationModule {

}
