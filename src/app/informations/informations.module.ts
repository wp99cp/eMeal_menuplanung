import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MarkdownModule } from 'ngx-markdown';
import { VersionHistoryModule } from '../modules/version-history/version-history.module';
import { DatenschutzComponent } from './datenschutz/datenschutz.component';
import { InformationspageComponent } from './informations-page/informations-page.component';
import { ImpressumComponent } from './impressum/impressum.component';
import { InformationsRoutingModule } from './informations-routing.module';
import { KontaktComponent } from './kontakt/kontakt.component';
import { ChangeLogComponent } from './change-log/change-log.component';
import { HelpComponent } from './help/help.component';


@NgModule({
  declarations: [
    InformationspageComponent,
    ImpressumComponent,
    DatenschutzComponent,
    KontaktComponent,
    ChangeLogComponent,
    HelpComponent
  ],
  imports: [
    CommonModule,
    InformationsRoutingModule,
    VersionHistoryModule,
    // mat design
    MatButtonModule,
    MatCardModule,
    MarkdownModule
  ]
})
export class InformationsModule {

}
