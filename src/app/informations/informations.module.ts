import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InformationsRoutingModule } from './informations-routing.module';
import { InfoPageComponent } from './info-page/info-page.component';


@NgModule({
  declarations: [InfoPageComponent],
  imports: [
    CommonModule,
    InformationsRoutingModule
  ]
})
export class InformationsModule { }
