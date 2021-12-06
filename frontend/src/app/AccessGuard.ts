import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthenticationService} from './application/_service/authentication.service';

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

      if (!await this.auth.isAdmin()) {
        return this.router.parseUrl(route.data.redirectURL);
      }

    }


    return true;

  }

}
