import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InformationsRoutingModule } from './informations-routing.module';
import { InfoPageComponent } from './info-page/info-page.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { HelpPageComponent } from './help-page/help-page.component';


@NgModule({
  declarations: [
    InfoPageComponent,
    HelpPageComponent
  ],
  imports: [
    CommonModule,
    InformationsRoutingModule,

    // mat design
    MatButtonModule,
    MatCardModule
  ]
})
export class InformationsModule {

}
