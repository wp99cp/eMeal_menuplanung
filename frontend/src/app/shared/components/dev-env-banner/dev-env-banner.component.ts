import {Component, OnInit} from '@angular/core';
import buildInfo from '../../../../build';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-dev-env-banner',
  templateUrl: './dev-env-banner.component.html',
  styleUrls: ['./dev-env-banner.component.sass']
})
export class DevEnvBanner implements OnInit {

  public build = buildInfo;
  public environment = environment;

  constructor() {
  }

  ngOnInit(): void {
  }

}
