import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {ActivatedRoute, Router} from '@angular/router';
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

  constructor(
    public fireAuth: AngularFireAuth,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute) {
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

        // try
        this.signInWithCeviDB();

        this.redirectToSignInPage();

      } else {

        // user is signed in
        this.redirectToApplication();
        MainMenuComponent.authServ = this;

      }
    });

  }

  /**
   * Authenticates a Firebase client using a full-page redirect flow with the GoogleAuthProvider
   *
   */
  signInWithGoogle() {

    this.location.replaceState('login/oauth-callback');

    this.fireAuth.auth.signInWithRedirect(new auth.GoogleAuthProvider());

  }

  signInWithCeviDB() {

    // check if it's an oauth-callback
    if (!this.location.path().includes('/oauth-callback')) {
      return;
    }

    this.route.queryParams.subscribe(pars => {

      const code = pars.code;

      if (!code) {
        return;
      }

      console.log(code);

      const request = new Request('https://europe-west1-cevizh11-menuplanung.cloudfunctions.net/createAccessToken?code=' + code);
      fetch(request).then(async req => {

        const json = await req.json();
        console.log(json);

        const customToken = json.data;
        await this.fireAuth.auth.signInWithCustomToken(customToken);

      });


    });


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
