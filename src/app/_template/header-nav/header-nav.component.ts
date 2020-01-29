import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


export interface HeaderNav {

  active: boolean;
  description: string;
  name: string;
  action: () => any;
  icon?: string;
  separatorAfter?: true

}

@Component({
  selector: 'app-header-nav',
  templateUrl: './header-nav.component.html',
  styleUrls: ['./header-nav.component.sass']
})
export class HeaderNavComponent {

  private static headerNav: HeaderNav[] = [];

  public static addToHeaderNav(navElem: HeaderNav, index = HeaderNavComponent.headerNav.length) {

    HeaderNavComponent.headerNav.splice(index, 0, navElem);

  }

  public static togle(name: string) {

    const element = HeaderNavComponent.headerNav.find(el => el.name === name);
    element.active = !element.active;

  }

  constructor(router: Router) {

    router.events.subscribe(() => (HeaderNavComponent.headerNav = []));

  }

  public getHeaderNav() {

    return HeaderNavComponent.headerNav;

  }

}
