import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthenticationService} from '../../_service/authentication.service';
import {TemplateHeaderComponent as Header} from 'src/app/_template/template-header/template-header.component';
import {HelpService} from '../../_service/help.service';
import firebase from "firebase/compat/app";
import User = firebase.User;

/**
 * WelcomPage of the eMeal appliction after signed in.
 * Provides some fast action (fast action overview).
 */
@Component({
  selector: 'app-welcom-page',
  templateUrl: './welcom-page.component.html',
  styleUrls: ['./welcom-page.component.sass']
})
export class WelcomPageComponent implements OnInit {

  public currentUser: Observable<User>;
  public title: string;

  constructor(public auth: AuthenticationService, public help: HelpService) {

    this.title = this.getRandTitle();

  }

  ngOnInit() {

    this.currentUser = this.auth.getCurrentUser();
    this.setHeaderInfo();

  }


  /** setzt die HeaderInfos für die aktuelle Seite */
  private setHeaderInfo(): void {
    Header.title = 'Lagerplanen leicht gemacht!';
    Header.path = [];

  }

  public getRandTitle() {

    const titles = [
      `Kochen ist nicht einfach, doch mit eMeal wird's zum Kinderspiel.`,
      `Willkommen bei eMeal, der Menüplanungs-Software für Lager.`,
      `Planen war noch nie so einfach! Beginne jetzt mit einem neuen Lager.`,
      `Spar dir Zeit und verwende deine Mahlzeiten in verschiedenen Lagern.`,
      `Gewusst? Mit der Import-Funktion können Mahlzeiten ganz einfach erstellt werden.`
    ];
    const randN = Math.round(Math.random() * (titles.length - 1));

    return titles[randN];

  }

}
