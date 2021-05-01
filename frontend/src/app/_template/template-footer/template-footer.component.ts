import {Component, OnInit} from '@angular/core';
import {copyrights} from '../../../../package.json';
import buildInfo from '../../../build';
import {SwissDateAdapter} from '../../utils/format-datapicker';

@Component({
  selector: 'app-template-footer',
  templateUrl: './template-footer.component.html',
  styleUrls: ['./template-footer.component.sass']
})
export class TemplateFooterComponent implements OnInit {

  public copyrights: string = copyrights;
  public buildInfo = buildInfo;

  public buildDate;

  constructor(public swissDateAdapter: SwissDateAdapter) {

    this.buildDate = swissDateAdapter.format(new Date(buildInfo.timestamp));

  }

  ngOnInit() {
  }

}
