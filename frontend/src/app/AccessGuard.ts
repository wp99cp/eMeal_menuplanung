import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthenticationService} from './application/_service/authentication.service';
import {User} from 'firebase/app';

@Injectable()
export class AccessGuard implements CanActivate {

  constructor(private auth: AuthenticationService, private router: Router) {
  }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    const isSignedIn = await new Promise(resolve =>
      this.auth.isSignedIn().subscribe(resolve)
    );


    if (route.data.notSignInRequired && isSignedIn) {
      return this.router.parseUrl(route.data.redirectURL);
    }

    if (route.data.requiresLogin && !isSignedIn) {
      return this.router.parseUrl(route.data.redirectURL);
    }

    if (route.data.requiresAdminRights) {

      const currentUser: User = await new Promise(res => this.auth.getCurrentUser().subscribe(r => res(r)));
      const idTokenResult = await currentUser.getIdTokenResult();

      if (!idTokenResult.claims.isAdmin) {
        return this.router.parseUrl(route.data.redirectURL);
      }

    }


    return true;

  }

}
