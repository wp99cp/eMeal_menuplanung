import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {AccessData} from '../_interfaces/firestoreDatatypes';
import {Location} from '@angular/common';
import {MainMenuComponent} from '../../_template/main-menu/main-menu.component';
import {auth, User} from 'firebase/app';


@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {

  constructor(public fireAuth: AngularFireAuth, private router: Router, private location: Location) {


  }

  public static generateCoworkersList(ownerUid: string, coworkers: User[]): AccessData {

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

  /**
   * Tracks the authState of the fireAuth Object.
   * If the authState changes this checks if the user is signed in or not.
   *
   * If the user isn't signed in, the user gets redirected to the signIn page.
   */
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
   * Authenticates a Firebase client using a full-page redirect flow with the GoogleAuthProvider
   *
   */
  signInWithGoogle() {

    this.fireAuth.auth.signInWithRedirect(new auth.GoogleAuthProvider());

  }

  signInWithCeviDB() {

    console.log('Auth with Cevi.DB: ');

    // request code from https://demo.hitobito.com/oauth/authorize?response_type=code&client_id=GGCqAXRFO8_Iq-V9AdHcZwgmR-6suvIA2qsAi6LanHo&redirect_uri=https://emeal.zh11.ch&scope=name
    const code = '';

    // request custom access token form cloud function
    const customToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTU5NjI4ODkxOSwiZXhwIjoxNTk2MjkyNTE5LCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay04d2I4ekBjZXZpemgxMS5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInN1YiI6ImZpcmViYXNlLWFkbWluc2RrLTh3Yjh6QGNldml6aDExLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwidWlkIjoiNGVhNWM1MDhhNjU2NmU3NjI0MDU0M2Y4LTE2MiJ9.VXnTqORCmMTHkKWD7SfFO_D-yHhbEmqPTs5kHUIlpEjH8uFM_m6plM4WurAf7kAvJOOnkZ79kb3-9Tt9DtM2APtcL0unlTGKCXGph4vOYglwcvYJVu-Ldb2mV9MWMYM_zEGtuTdXskn3e5hTLhDdUXh0DfqOlMh0W9M4YHitPqPeJNMMin3J7MJK9LroSlqAYPUmqF6aWxwGrnlpiSNuQqmYHW_zP0EYKISj3wnoR19337OIdyFMOHHjs-i_omkhfvrdMKIhV2iniMp764VeGoETxdb8rlOge_LnGpYThZFIPI697PI4_WOMRX2-ie8VGoyc1fcQoEBD0gSlLZRkoA';
    this.fireAuth.auth.signInWithCustomToken(customToken);

  }

  signIn(email: string, password: string) {

    this.fireAuth.auth.signInWithEmailAndPassword(email, password);

  }

  /**
   * returns the current user of the fireAuth.authState
   */
  getCurrentUser(): Observable<User> {

    return this.fireAuth.authState;

  }

  /**
   * Checks if the user is signed in
   *
   */
  isSignedIn(): Observable<boolean> {

    return this.fireAuth.authState.pipe(map(userData => (userData != null)));

  }

  /**
   * signOut the current user
   */
  signOut() {

    this.fireAuth.auth.signOut()
      .then(() => console.log('User signed out!'));

  }

  redirectToApplication() {

    // redirect to application page if still on signIn page
    if (this.location.path().includes('/login')) {
      this.router.navigate(['/app']);
    }

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

}
