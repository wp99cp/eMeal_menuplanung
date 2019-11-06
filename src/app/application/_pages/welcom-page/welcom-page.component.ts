import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../_interfaces/user';
import { AuthenticationService } from '../../_service/authentication.service';

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

  protected currentUser: Observable<User>;

  constructor(public auth: AuthenticationService) { }

  ngOnInit() {

    this.currentUser = this.auth.getCurrentUser();

  }

}
