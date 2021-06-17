import {Component} from '@angular/core';
import {AuthenticationService} from '../application/_service/authentication.service';
import {Router} from '@angular/router';
import {HelpService} from "../application/_service/help.service";

@Component({
  selector: 'app-sign-in-callback',
  templateUrl: './sign-in-callback.component.html',
  styleUrls: ['./sign-in-callback.component.sass']
})
export class SignInCallbackComponent {

  // in ms
  private static intervall = 150;
  private static timeout = 2500;
  private checkIfUsingCeviDB = true;

  constructor(auth: AuthenticationService, router: Router, public help: HelpService) {

    this.checkSignIn(auth, router, 0);

  }

  async checkSignIn(auth: AuthenticationService, router: Router, counter) {

    // Check if sign in with CeviDB
    if (this.checkIfUsingCeviDB && await auth.signInWithCeviDB()) {
      this.checkIfUsingCeviDB = false;
    }

    // access auth state
    const isSignedIn = await new Promise(resolve =>
      auth.isSignedIn().subscribe(resolve)
    );

    // if user is sign in or after timeout we redirect to /app
    if (isSignedIn || counter * SignInCallbackComponent.intervall >= SignInCallbackComponent.timeout) {
      await router.navigateByUrl('/app');
      return;
    }

    // retry after intervall
    setTimeout(() => {
      this.checkSignIn(auth, router, counter + 1);
    }, SignInCallbackComponent.intervall);

  }


}
