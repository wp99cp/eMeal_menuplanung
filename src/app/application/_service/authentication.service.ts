import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../_interfaces/user';
import { MainMenuComponent } from 'src/app/_template/main-menu/main-menu.component';


@Injectable({
  providedIn: 'root',
})
/**
 * This service handels the authentication process.
 * AuthenticationService is singleton. The active instance can be globaly access over
 * AuthenticationService.service
 *
 */
export class AuthenticationService {


  // needs for stop automatic resignin
  private signInSubscription: Subscription;




  constructor(public fireAuth: AngularFireAuth, private router: Router) { }



  /**
   * SignIn and keep force resignIn until the methode signOut get called.
   *
   */
  public signIn() {
    this.signInSubscription =
      this.fireAuth.authState.subscribe(user => {
        if (user == null) {
          this.fireAuth.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
        } else {
          MainMenuComponent.authServ = this;
        }
      });

  }


  /** Returns the current User of the database  */
  public getCurrentUser(): Observable<User> {

    return this.fireAuth.authState.pipe(
      map((userData) => {
        return { displayName: userData.displayName, uid: userData.uid, email: userData.email };
      })
    );

  }

  public isSignedIn(): Observable<boolean> {

    return this.fireAuth.authState.pipe(map(userData => (userData != null)));

  }

  /**
   * signOut the current user an navigate to information page
   *
   * @param redictToInfomationPage
   *
   */
  public signOut(redictToInfomationPage: boolean = true) {

    // stop automatic resignin an signOut the current user
    if (this.signInSubscription) {
      this.signInSubscription.unsubscribe();
    }
    this.fireAuth.auth.signOut();

    // Navigate to informationPage

    /* TODO: this is by far not the best way to do it!
    *  The problem is, that the signIn method only get called once per refresh, since the application never refreshes this results
    *  in a situation the user can't resignIn. -> The fastest way to fix this is by reload the page after signOut but this is awful!
    *  A better way would be to call the method signIn after each entrance to the ApplicationModule (route "/app/.."), such that the
    *  user don't havt to reload any data.
    */
    if (redictToInfomationPage) {
      this.router.navigate(['/']).then(r => window.location.reload());
    }

  }

}
