import { Component } from '@angular/core';
import { Router } from '@angular/router';


export interface HeaderNav {

  active: boolean;
  description: string;
  name: string;
  action: () => any;
  icon?: string;
  separatorAfter?: true;
  type?: 'toggle' | 'icon';
  values?: string[];

}

@Component({
  selector: 'app-header-nav',
  templateUrl: './header-nav.component.html',
  styleUrls: ['./header-nav.component.sass']
})
export class HeaderNavComponent {

  // add popup for account to sign-out, change settingts and view username

  private static headerNav: HeaderNav[] = [];

  public static addToHeaderNav(navElem: HeaderNav, index = HeaderNavComponent.headerNav.length) {

    HeaderNavComponent.headerNav.splice(index, 0, navElem);

  }

  public static toggle(name: string) {

    const element = HeaderNavComponent.headerNav.find(el => el.name === name);
    element.active = !element.active;

  }

  public static turnOff(name: string) {

    const element = HeaderNavComponent.headerNav.find(el => el.name === name);
    if (element) {
      element.active = false;
    }

  }

  public static turnOn(name: string) {

    const element = HeaderNavComponent.headerNav.find(el => el.name === name);
    if (element) {
      element.active = true;
    }

  }

  public static remove(name: string) {

    HeaderNavComponent.headerNav = HeaderNavComponent.headerNav.filter(el => (el.name !== name));

  }

  constructor(router: Router) {

    router.events.subscribe(() => (HeaderNavComponent.headerNav = []));

  }

  public getHeaderNav() {

    return HeaderNavComponent.headerNav;

  }

}
