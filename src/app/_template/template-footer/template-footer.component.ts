import { Component, OnInit } from '@angular/core';
import { version } from '../../../../package.json';

@Component({
  selector: 'app-template-footer',
  templateUrl: './template-footer.component.html',
  styleUrls: ['./template-footer.component.sass']
})
export class TemplateFooterComponent implements OnInit {

  public version: string = version;

  constructor() { }

  ngOnInit() {
  }

}
