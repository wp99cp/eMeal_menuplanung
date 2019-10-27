import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { Subscription } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
/**
 * This service handels the authentication process.
 * AuthenticationService is singleton. The active instance can be globaly access over
 * AuthenticationService.service
 * 
 */
export class AuthenticationService {

  private static service: AuthenticationService = null;
  private static user: firebase.User = null;

  /** Get the firebase.User which is currently signed in */
  public static getUser(): firebase.User {
    return AuthenticationService.user;
  }

  /** get the AuthenticationService */
  public static getService(): AuthenticationService {
    return AuthenticationService.service;
  }


  // ************************************************
  // ************************************************
  // ************************************************

  constructor(public fireAuth: AngularFireAuth, private router: Router) {

    // sets global service filed
    AuthenticationService.service = this;

    // Update global user field
    fireAuth.user.subscribe(user => AuthenticationService.user = user);

  }

  // needs for stop automatic resignin
  private signInSubscription: Subscription;

  /**
   * SignIn and keep force resignIn until the methode signOut get called.
   * 
   */
  public signIn() {
    this.signInSubscription =
      this.fireAuth.authState.subscribe(user => {
        if (user == null) {
          this.fireAuth.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider);
        }
      });

  }

  /**
   * signOut the current user an navigate to information page
   * 
   * @param redictToInfomationPage 
   * 
   */
  public signOut(redictToInfomationPage: boolean = true) {

    // stop automatic resignin an signOut the current user
    this.signInSubscription.unsubscribe();
    this.fireAuth.auth.signOut();

    // Navigate to informationPage

    /* TODO: this is by far not the best way to do it!
    *  The problem is, that the signIn method only get called once per refresh, since the application never refreshes this results
    *  in a situation the user can't resignIn. -> The fastest way to fix this is by reload the page after signOut but this is awful!
    *  A better way would be to call the method signIn after each entrance to the ApplicationModule (route "/app/.."), such that the
    *  user don't havt to reload any data.
    */
    if (redictToInfomationPage) this.router.navigate(['/']).then(r => window.location.reload());

  }

}
