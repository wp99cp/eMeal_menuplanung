import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


/**
 * Header Component für sämtliche Seiten innerhalb der Application.
 *
 */
@Component({
  selector: 'app-template-header',
  templateUrl: './template-header.component.html',
  styleUrls: ['./template-header.component.sass']
})
export class TemplateHeaderComponent implements OnInit {


  // Standardtitel: Menüplanung für Lager
  public static title = 'Menüplanung für Lager';
  public static path: string[];
  static TemplateHeaderComponent: {};

  public static menuState = false;
  public static forcedState = false;

  public static showMenu(force = null, fixState = false) {

    if (fixState) {
      TemplateHeaderComponent.forcedState = force;
    } else if (force) {
      TemplateHeaderComponent.forcedState = false;
    }

    if ((TemplateHeaderComponent.forcedState === false && force === null && TemplateHeaderComponent.menuState) ||
      (force !== null && TemplateHeaderComponent.menuState !== force)) {

      TemplateHeaderComponent.menuState = !TemplateHeaderComponent.menuState;

      document.querySelector('app-root').classList.toggle('show-menu');
      document.querySelector('app-main-menu').classList.toggle('show-menu');
      document.querySelector('.header').classList.toggle('show-menu');
      document.querySelector('.show-main-menu').classList.toggle('show-menu');
    }
  }

  constructor(private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit() {

    if (document.body.clientWidth > 1200) {
      TemplateHeaderComponent.showMenu(true, true);
    }
    window.addEventListener('resize', (event) => {
      if (document.body.clientWidth > 1200) {
        TemplateHeaderComponent.showMenu(true, true);
      } else {
        TemplateHeaderComponent.showMenu(false);

      }
    });

  }




  // Methoden für das HTML file
  public getTitle() { return TemplateHeaderComponent.title; }
  public getPath() { return TemplateHeaderComponent.path; }

  public navigateTo(level: number = 1) {

    let urlStr = window.location.pathname;

    for (let i = 0; i < this.getPath().length - level - 1; i++) {

      urlStr = urlStr.substring(0, urlStr.lastIndexOf('/'));

    }

    this.router.navigate([urlStr]);

  }


  public showMenu() {

    TemplateHeaderComponent.showMenu(true);

  }



}
