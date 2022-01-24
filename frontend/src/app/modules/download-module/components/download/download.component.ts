import { Component, Input, OnInit } from '@angular/core';
import {SwissDateAdapter} from "../../../../shared/utils/format-datapicker";

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.sass']
})
export class DownloadComponent implements OnInit {

  @Input() public docPath: string;
  @Input() public changeDate: Date;
  @Input() public name: string;

  public docTypeClass = '';

  constructor(public swissDateAdapter: SwissDateAdapter) { }

  ngOnInit() {

    if (this.docPath.includes('.pdf')) {
      this.docTypeClass = 'pdfIcon';
    } else if (this.docPath.includes('.csv')) {
      this.docTypeClass = 'csvIcon';
    } else if (this.docPath.includes('.html')) {
      this.docTypeClass = 'htmlIcon';
    } else {
      this.docTypeClass = 'unknownIcon';
    }

  }


}
