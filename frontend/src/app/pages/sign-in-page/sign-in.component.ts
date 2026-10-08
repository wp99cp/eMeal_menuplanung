import {Component} from '@angular/core';
import {AuthenticationService} from "../../modules/application-module/services/authentication.service";
import {Router} from '@angular/router';
import {environment} from '../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-sign-in-page',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.sass']
})
export class SignInComponent {

  // fake accounts of the local emulator, empty for the hosted environments
  public devAccounts = environment.devAccounts;

  constructor(public auth: AuthenticationService, private router: Router) {
  }

  signInWithDevAccount(account: { email: string, password: string }) {

    this.auth.signIn(account.email, account.password)
      .then(() => this.router.navigate(['/app']))
      .catch(console.error);

  }


  signInWithCeviDB() {

    const clientUid = 'xuNev4-siwa_7NC_KacPVkqyo29gAW93WFuz2cIWn0c';
    const redictURL = 'https://emeal.zh11.ch/login/oauth-callback';
    window.location.href = 'https://db.cevi.ch/oauth/authorize?response_type=code&client_id=' + clientUid + '&redirect_uri=' + redictURL + '&scope=name';

  }
}
