import { Component, OnInit } from '@angular/core';
import { TemplateHeaderComponent as Header } from 'src/app/_template/template-header/template-header.component';

import { version as softwareVersion } from '../../../../package.json';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.sass']
})
export class SettingsComponent implements OnInit {

  public version: string = softwareVersion;

  // TODO: set automatic
  public username = 'Cyrill Püntner v/o JPG';
  public mail = 'jpg@zh11.ch';

  // TODO: include private authenticationService
  constructor() {

    this.setHeaderInfo();

  }

  ngOnInit() {

    // fields with authenticationService
    // TODO: include authenticationService into this module

  }

  private setHeaderInfo(): void {

    Header.title = 'Einstellungen';
    Header.path = ['Startseite', 'Einstellungen'];

  }

}
