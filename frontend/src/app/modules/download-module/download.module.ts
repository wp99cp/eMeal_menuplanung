import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DownloadComponent} from "./components/download/download.component";


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
