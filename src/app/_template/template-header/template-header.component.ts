import { Component } from '@angular/core';
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
export class TemplateHeaderComponent {

  // Standardtitel: Menuplanung für Lager
  public static title = 'Menuplanung für Lager';
  public static path: string[];

  constructor(private router: Router, private route: ActivatedRoute) { }

  // Methoden für das HTML file
  protected getTitle() { return TemplateHeaderComponent.title; }
  protected getPath() { return TemplateHeaderComponent.path; }

  protected navigateTo(level: number = 1) {

    let urlStr = window.location.pathname;

    for (let i = 0; i < this.getPath().length - level - 1; i++) {

      urlStr = urlStr.substring(0, urlStr.lastIndexOf('/'));

    }

    this.router.navigate([urlStr]);

  }

}
