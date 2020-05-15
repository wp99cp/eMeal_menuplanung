import {Component} from '@angular/core';
import {AuthenticationService} from '../application/_service/authentication.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.sass']
})
export class SignInComponent {

  constructor(public auth: AuthenticationService) {

    // user already sign in
    if (auth.fireAuth.auth.currentUser !== null) {
      auth.redirectToApplication();
    }

  }

}
