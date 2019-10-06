import { Component, OnInit } from '@angular/core';
import { version } from '../../../../package.json';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.sass']
})
export class SettingsComponent implements OnInit {

  public version: string = version;

  // TODO: set automatic
  public username: string = "Lorem Ipsum";
  public mail: string = "lorem.ipsum@domain.org";

  constructor() { }

  ngOnInit() {
  }

}
