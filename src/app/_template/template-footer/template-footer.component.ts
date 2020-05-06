import { Component, OnInit } from '@angular/core';
import { version } from '../../../../package.json';
import { copyrights } from '../../../../package.json';

@Component({
  selector: 'app-template-footer',
  templateUrl: './template-footer.component.html',
  styleUrls: ['./template-footer.component.sass']
})
export class TemplateFooterComponent implements OnInit {

  // TODO: add link to impressum
  // --> eigenes Impressum/ Datenschutz-Seite für eMeal

  public version: string = version;
  public copyrights: string = copyrights;

  constructor() { }

  ngOnInit() {
  }

}
