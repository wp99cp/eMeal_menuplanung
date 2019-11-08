import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Camp } from '../../_class/camp';
import { Meal } from '../../_class/meal';
import { SpecificMeal } from '../../_class/specific-meal';
import { DatabaseService } from '../../_service/database.service';

@Component({
  selector: 'app-edit-meal',
  templateUrl: './edit-meal.component.html',
  styleUrls: ['./edit-meal.component.sass']
})
export class EditMealComponent implements OnInit {

  private meal: Observable<Meal>;
  private specificMeal: Observable<SpecificMeal>;

  private mealInfo: FormGroup;
  private camp: Camp;
  private campId: string;
  private dayNumber: string;
  private mealId: string;

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private databaseService: DatabaseService) { }

  ngOnInit() {

    // load camp from url
    this.route.url.subscribe(url => {
      // get mealId as last part of the url
      this.campId = url[url.length - 5].path;
      this.dayNumber = url[url.length - 3].path;
      this.mealId = url[url.length - 1].path;

      // load Meal and specific meal
      this.meal = this.databaseService.getMealById(this.mealId, this.campId);
      this.specificMeal = this.databaseService.getSpecificMeal(this.mealId, this.campId);

    });

    this.meal.subscribe(meal => {
      this.mealInfo = this.formBuilder.group({
        title: meal.title
      });
    });

  }

}
