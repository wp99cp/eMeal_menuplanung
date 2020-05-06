import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MarkdownModule } from 'ngx-markdown';
import { VersionHistoryModule } from '../modules/version-history/version-history.module';
import { DatenschutzComponent } from './datenschutz/datenschutz.component';
import { InformationspageComponent } from './help-page/informations-page.component';
import { ImpressumComponent } from './impressum/impressum.component';
import { InfoPageComponent } from './info-page/info-page.component';
import { InformationsRoutingModule } from './informations-routing.module';
import { KontaktComponent } from './kontakt/kontakt.component';


@NgModule({
  declarations: [
    InfoPageComponent,
    InformationspageComponent,
    ImpressumComponent,
    DatenschutzComponent,
    KontaktComponent
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
