import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VersionHistoryComponent } from './components/version-history/version-history.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    VersionHistoryComponent
  ],
  exports: [
    VersionHistoryComponent
  ]
})
export class VersionHistoryModule { }
