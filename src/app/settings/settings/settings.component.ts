import { Component, OnInit } from '@angular/core';
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
  constructor() { }

  ngOnInit() {

    // fields with authenticationService
    // TODO: include authenticationService into this module

  }

}
