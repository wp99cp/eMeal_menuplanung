import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VersionHistoryComponent } from './components/version-history/version-history.component';
import {RouterModule} from "@angular/router";

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [
    VersionHistoryComponent
  ],
  exports: [
    VersionHistoryComponent
  ]
})
export class VersionHistoryModule { }
