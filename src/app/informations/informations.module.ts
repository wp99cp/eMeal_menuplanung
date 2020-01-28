import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InformationsRoutingModule } from './informations-routing.module';
import { InfoPageComponent } from './info-page/info-page.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { InformationspageComponent } from './help-page/informations-page.component';
import { VersionHistoryModule } from '../modules/version-history/version-history.module';

@NgModule({
  declarations: [
    InfoPageComponent,
    InformationspageComponent
  ],
  imports: [
    CommonModule,
    InformationsRoutingModule,
    VersionHistoryModule,
    // mat design
    MatButtonModule,
    MatCardModule
  ]
})
export class InformationsModule {

}
