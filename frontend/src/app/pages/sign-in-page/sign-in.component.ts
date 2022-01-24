import {Component} from '@angular/core';
import {AuthenticationService} from "../../modules/application-module/services/authentication.service";

@Component({
  selector: 'app-sign-in-page',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.sass']
})
export class SignInComponent {

  constructor(public auth: AuthenticationService) {
  }


  signInWithCeviDB() {

    const clientUid = 'xuNev4-siwa_7NC_KacPVkqyo29gAW93WFuz2cIWn0c';
    const redictURL = 'https://emeal.zh11.ch/login/oauth-callback';
    window.location.href = 'https://db.cevi.ch/oauth/authorize?response_type=code&client_id=' + clientUid + '&redirect_uri=' + redictURL + '&scope=name';

  }
}
