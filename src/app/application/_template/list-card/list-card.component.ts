import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Meal} from '../../_class/meal';
import {Recipe} from '../../_class/recipe';
import {Camp} from '../../_class/camp';
import {DatabaseService} from '../../_service/database.service';

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

  constructor(private databaseServcie: DatabaseService){}

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

  removeDots(element: Recipe){

    document.getElementById(element.documentId + '-title').classList.remove('showDots');

  }

  changeName(element: Recipe) {

    const newName = document.getElementById(element.documentId + '-title').innerText;
    console.log(newName);

    element.name = newName;
    this.databaseServcie.updateDocument(element);

    document.getElementById(element.documentId + '-accept').classList.remove('changed');
    document.getElementById(element.documentId + '-title').classList.add('showDots');

  }


}
