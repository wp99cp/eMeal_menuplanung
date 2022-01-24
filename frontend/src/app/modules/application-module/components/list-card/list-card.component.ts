import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Meal} from '../../classes/meal';
import {Recipe} from '../../classes/recipe';
import {Camp} from '../../classes/camp';
import {DatabaseService} from '../../services/database.service';

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
  public icon;

  constructor(private databaseService: DatabaseService) {

  }

  ngOnInit(): void {

    if (this.cardElement instanceof Meal) {
      this.elementName = 'Mahlzeit';
      this.topCategorieName = 'Lager';
      this.topCategoriePath = 'camps';
      this.categoriePath = 'meals';
      this.usage = this.cardElement.usedInCamps.length;
      this.icon = 'fastfood';

    } else if (this.cardElement instanceof Recipe) {
      this.elementName = 'Rezept';
      this.topCategorieName = 'Mahlzeit-/en';
      this.topCategoriePath = 'meals';
      this.categoriePath = 'recipes';
      this.usage = this.cardElement.usedInMeals.length;
      this.icon = 'menu_book';


    } else if (this.cardElement instanceof Camp) {
      this.elementName = 'Lager';
      this.topCategorieName = '';
      this.topCategoriePath = '';
      this.categoriePath = 'camps';
      this.usage = 0;
      this.icon = 'nature_people';


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
