import {Component} from '@angular/core';
import {TemplateHeaderComponent} from './_template/template-header/template-header.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {


  title = 'eMeal';

  /** wird bei jedem Seitenwechsel ausgeführt */
  onActivate(event) {

    const scrollToTop = window.setInterval(() => {
      const pos = window.pageYOffset;
      if (pos > 0) {
        window.scrollTo(0, pos - 50); // how far to scroll on each step
      } else {
        window.clearInterval(scrollToTop);
      }
    }, 16);
  }

  public closeMenu() {

    TemplateHeaderComponent.showMenu();

  }

}
