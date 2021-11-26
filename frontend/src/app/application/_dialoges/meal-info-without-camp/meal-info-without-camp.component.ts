import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Camp} from '../../_class/camp';
import {Meal} from '../../_class/meal';
import {SpecificMeal} from '../../_class/specific-meal';
import {DatabaseService} from '../../_service/database.service';

@Component({
  selector: 'app-meal-info-without-camp',
  templateUrl: './meal-info-without-camp.component.html',
  styleUrls: ['./meal-info-without-camp.component.sass']
})
export class MealInfoWithoutCampComponent implements OnInit {

  public mealInfo: FormGroup;
  public meal: Meal;
  public mealAccess = false;
  public valueHasChanged = false;


  constructor(
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) data: { camp: Camp, meal: Meal, specificMeal: SpecificMeal },
    private db: DatabaseService) {

    this.meal = data.meal;

    // create a copy for the form, the original value is needed for the comparison
    this.mealInfo = this.formBuilder.group({

      title: {value: this.meal.name, disabled: true},
      description: {value: this.meal.description, disabled: true},

    });

    const originalValues = JSON.stringify({

      title: this.meal.name,
      description: this.meal.description,

    });

    // set up change listner
    this.mealInfo.valueChanges.subscribe(values => {
      this.valueHasChanged = JSON.stringify(values) === originalValues;
    });


  }

  ngOnInit(): void {


    this.db.canWrite(this.meal).then(access => {
      this.mealAccess = access;
      if (access) {
        this.mealInfo.controls.title.enable();
        this.mealInfo.controls.description.enable();
      }
    });

  }


  saveValueChanges() {

    this.meal.description = this.mealInfo.value.description;
    this.meal.name = this.mealInfo.value.title;
    return this.meal;

  }

}
