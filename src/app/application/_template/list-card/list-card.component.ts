import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Meal} from '../../_class/meal';
import {Recipe} from '../../_class/recipe';
import {Camp} from '../../_class/camp';
import {DatabaseService} from '../../_service/database.service';
import {Router} from "@angular/router";
import {HelpService} from "../../_service/help.service";

/*
  TODO: Bearbeitung der Namen ist visuell schlecht sichtbar. Evtl. outline wieder hinzufügen....
  oder Hintergrundfarbe anpassen....
 */


@Component({
  selector: 'app-list-card',
  templateUrl: './list-card.component.html',
  styleUrls: ['./list-card.component.sass']
})
export class ListCardComponent implements OnInit {

  @Input() public cardElement: any;
  @Input() public access: boolean;

  @Output() copy = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  public elementName;
  public topCategorieName;
  public topCategoriePath;
  public categoriePath;
  public usage;

  constructor(private databaseService: DatabaseService, router: Router, helpService: HelpService) {

    helpService.addHelpMessage({
      title: 'Lager, Mahlzeiten und Rezepte umbenennen.',
      message: `Lager, Mahlzeiten und Rezepte schnell und einfach direkt in der Kachel-übersicht umbenennt werden. <br>
                Klicke hierfür einfach auf den Namen des Lagers. Nun kannst du ihn bearbeiten. Mit einem Klick auf den
                grünen Hacken bestätigst du deine Eingabe. <br>
                <br>
                <img width="100%" src="/assets/img/help_info_messages/Rename_Camps.png">`,
      url: router.url
    });

  }

  ngOnInit(): void {

    if (this.cardElement instanceof Meal) {
      this.elementName = 'Mahlzeit';
      this.topCategorieName = 'Lager';
      this.topCategoriePath = 'camps';
      this.categoriePath = 'meals';
      this.usage = this.cardElement.usedInCamps.length;

    } else if (this.cardElement instanceof Recipe) {
      this.elementName = 'Rezept';
      this.topCategorieName = 'Mahlzeit-/en';
      this.topCategoriePath = 'meals';
      this.categoriePath = 'recipes';
      this.usage = this.cardElement.usedInMeals.length;

    } else if (this.cardElement instanceof Camp) {
      this.elementName = 'Lager';
      this.topCategorieName = '';
      this.topCategoriePath = '';
      this.categoriePath = 'camps';
      this.usage = 0;

    }

  }


  typesName(element: Recipe) {

    document.getElementById(element.documentId + '-accept').classList.add('changed');

  }

  removeDots(element: Recipe) {

    document.getElementById(element.documentId + '-title').classList.remove('showDots');

  }

  changeName(element: Recipe) {

    const newName = document.getElementById(element.documentId + '-title').innerText;
    console.log(newName);

    element.name = newName;
    this.databaseService.updateDocument(element);

    document.getElementById(element.documentId + '-accept').classList.remove('changed');
    document.getElementById(element.documentId + '-title').classList.add('showDots');

  }


}
