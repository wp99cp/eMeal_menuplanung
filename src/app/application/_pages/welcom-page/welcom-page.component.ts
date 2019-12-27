import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../_interfaces/user';
import { AuthenticationService } from '../../_service/authentication.service';
import { TemplateHeaderComponent as Header } from 'src/app/_template/template-header/template-header.component';

/**
 * WelcomPage of the eMeal appliction after signed in.
 * Provides some fast action (fast action overview).
 */
@Component({
  selector: 'app-welcom-page',
  templateUrl: './welcom-page.component.html',
  styleUrls: ['./welcom-page.component.sass']
})
export class WelcomPageComponent implements OnInit {


  public currentUser: Observable<User>;

  constructor(public auth: AuthenticationService) { }

  ngOnInit() {

    this.currentUser = this.auth.getCurrentUser();

    this.setHeaderInfo();
  }


  /** setzt die HeaderInfos für die aktuelle Seite */
  private setHeaderInfo(): void {


    Header.title = 'Lagerplanen leicht gemacht!';
    Header.path = [];

  }

}
