import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DownloadComponent} from "./download/download.component";


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    DownloadComponent
  ],
  exports: [
    DownloadComponent
  ]
})
export class DownloadModule {
}
