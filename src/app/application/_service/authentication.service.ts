import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {Router} from '@angular/router';
import * as firebase from 'firebase';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {AccessData} from '../_interfaces/firestoreDatatypes';
import {Location} from '@angular/common';
import {MainMenuComponent} from '../../_template/main-menu/main-menu.component';


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

  constructor(public fireAuth: AngularFireAuth, private router: Router, private location: Location) {
  }

  public static generateCoworkersList(ownerUid: string, coworkers: firebase.User[]): AccessData {

    const uidList: AccessData = {};

    if (coworkers !== undefined) {
      coworkers.forEach(coworker => {
        const uid = coworker.uid;
        if (ownerUid !== uid) {
          uidList[uid] = 'owner';
        }
      });
    }

    return uidList;

  }

  public trackCredentials() {

    this.fireAuth.authState.subscribe(user => {

      // still in public routes
      if (!this.location.path().includes('/login') && !this.location.path().includes('/app')) {
        return;
      }

      // no credentials
      if (user === null) {
        this.redirectToSignInPage();
      }

      // user is signed in
      this.redirectToApplication();
      MainMenuComponent.authServ = this;

    });

  }

  /**
   * Test the credentials
   *
   */
  private redirectToSignInPage() {

    // redirect to signIn page if not already there
    if (!this.location.path().includes('/login')) {
      this.router.navigate(['/login']);
    }

  }

  private redirectToApplication() {

    // redirect to application page if still on signIn page
    if (this.location.path().includes('/login')) {
      this.router.navigate(['/app']);
    }

  }

  signInWithGoogle() {

    this.fireAuth.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());

  }

  getCurrentUser(): Observable<firebase.User> {

    return this.fireAuth.authState;

  }

  isSignedIn(): Observable<boolean> {

    return this.fireAuth.authState.pipe(map(userData => (userData != null)));

  }

  signOut() {

    this.fireAuth.auth.signOut()
      .then(() => console.log('User signed out!'));

  }

}
