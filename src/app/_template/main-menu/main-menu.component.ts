import {Component} from '@angular/core';
import {AuthenticationService} from 'src/app/application/_service/authentication.service';
import {TemplateHeaderComponent} from '../template-header/template-header.component';
import {Router} from '@angular/router';
import {Location} from '@angular/common';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.sass']
})
export class MainMenuComponent {

  public static authServ: AuthenticationService;

  constructor(private router: Router, private location: Location) {
  }

  public closeMenu() {
    TemplateHeaderComponent.showMenu();
  }

  public isSignedIn() {
    return this.router.url.includes('app');
  }

  public signOut() {

    if (MainMenuComponent.authServ) {
      MainMenuComponent.authServ.signOut();
    }

  }

}
