import {Component, OnInit} from '@angular/core';
import buildInfo from '../../build';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-develop-enviroment-banner',
  templateUrl: './develop-enviroment-banner.component.html',
  styleUrls: ['./develop-enviroment-banner.component.sass']
})
export class DevelopEnviromentBannerComponent implements OnInit {

  public build = buildInfo;
  public environment = environment;

  constructor() {
  }

  ngOnInit(): void {
  }

}
