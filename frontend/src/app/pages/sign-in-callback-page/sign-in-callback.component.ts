import {Component} from '@angular/core';
import {Router} from '@angular/router';

import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthenticationService} from "../../modules/application-module/services/authentication.service";
import {HelpService} from "../../modules/application-module/services/help.service";

@Component({
  selector: 'app-sign-in-page-callback',
  templateUrl: './sign-in-callback.component.html',
  styleUrls: ['./sign-in-callback.component.sass']
})
export class SignInCallbackComponent {

  // in ms
  private static intervall = 150;
  private static timeout = 2500;
  private checkIfUsingCeviDB = true;


  constructor(auth: AuthenticationService,
              router: Router,
              private snackBar: MatSnackBar,
              public helpService: HelpService) {

    this.checkSignIn(auth, router, 0);

  }

  async checkSignIn(auth: AuthenticationService, router: Router, counter) {

    if (counter === 4) {

      this.snackBar.open('Der Anmeldeprozess dauert länger als gewöhnlich!', 'Hilfe anzeigen').onAction()
        .subscribe(() => this.helpService.openHelpPopup('sign-in-page-info'));

    }

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
