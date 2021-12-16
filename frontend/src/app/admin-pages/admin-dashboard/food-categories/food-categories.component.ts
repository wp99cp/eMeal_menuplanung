import { Component, OnInit } from '@angular/core';
import {DatabaseService} from "../../../application/_service/database.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-food-categories',
  templateUrl: './food-categories.component.html',
  styleUrls: ['./food-categories.component.sass']
})
export class FoodCategoriesComponent implements OnInit {

  public uncategorizedFood: Observable<any>;
  public corrections: Observable<any>;

  constructor(private db: DatabaseService) { }

  ngOnInit(): void {

    this.uncategorizedFood = this.db.getUncategorizedFood();
    this.corrections = this.db.getResentCorrections();

  }

}
