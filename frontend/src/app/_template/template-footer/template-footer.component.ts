import { Component, OnInit } from '@angular/core';
import { version } from '../../../../package.json';
import { copyrights } from '../../../../package.json';
import buildInfo from '../../../build';

@Component({
  selector: 'app-template-footer',
  templateUrl: './template-footer.component.html',
  styleUrls: ['./template-footer.component.sass']
})
export class TemplateFooterComponent implements OnInit {

  public copyrights: string = copyrights;
  public buildInfo = buildInfo;

  constructor() { }

  ngOnInit() {
  }

}
