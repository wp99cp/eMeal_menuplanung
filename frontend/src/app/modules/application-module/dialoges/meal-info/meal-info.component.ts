import {Component, Inject, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Camp} from '../../classes/camp';
import {Meal} from '../../classes/meal';
import {SpecificMeal} from '../../classes/specific-meal';
import {DatabaseService} from '../../services/database.service';

@Component({
  selector: 'app-meal-info',
  templateUrl: './meal-info.component.html',
  styleUrls: ['./meal-info.component.sass']
})
export class MealInfoComponent implements OnInit {

  public mealInfo: UntypedFormGroup;

  public camp: Camp;
  public specificMeal: SpecificMeal;
  public meal: Meal;

  public mealAccess = false;
  public specificMealAccess = false;
  public valueHasChanged = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { camp: Camp, meal: Meal, specificMeal: SpecificMeal },
    private formBuilder: UntypedFormBuilder,
    private db: DatabaseService) {

    this.camp = data.camp;
    this.specificMeal = data.specificMeal;
    this.meal = data.meal;


    // create a copy for the form, the original value is needed for the comparison
    this.mealInfo = this.formBuilder.group({

      title: {value: this.meal.name, disabled: true},
      description: {value: this.meal.description, disabled: true},

      // der weekTitle eines spezifischenMeal muss nicht zwingend gesetzt sein...
      // in diesem Fall wird der meal.title übernommen und bei der nächsten Speicherung abgespeichert
      weekTitle: {
        value: this.specificMeal.weekTitle !== '' ? this.specificMeal.weekTitle : this.meal.name,
        disabled: true
      },
      overrideParticipants: {
        value: this.specificMeal.overrideParticipants,
        disabled: true
      },
      participants: {
        value: this.specificMeal.participants,
        disabled: true
      },
    });

    const originalValues = JSON.stringify({

      title: this.meal.name,
      description: this.meal.description,
      weekTitle: this.specificMeal.weekTitle !== '' ? this.specificMeal.weekTitle : this.meal.name,
      overrideParticipants: this.specificMeal.overrideParticipants,
      participants: this.specificMeal.participants

    });

    // set up change listner
    this.mealInfo.valueChanges.subscribe(values => {
      this.valueHasChanged = JSON.stringify(values) === originalValues;
    });

  }

  ngOnInit() {

    this.db.canWrite(this.meal).then(access => {
      this.mealAccess = access;
      if (access) {
        this.mealInfo.controls.title.enable();
        this.mealInfo.controls.description.enable();
      }
    });

    this.db.canWrite(this.specificMeal).then(access => {
      this.specificMealAccess = access;
      if (access) {
        this.mealInfo.controls.participants.enable();
        this.mealInfo.controls.overrideParticipants.enable();
        this.mealInfo.controls.weekTitle.enable();
      }
    });

  }


  saveValueChanges() {

    this.meal.description = this.mealInfo.value.description;
    this.meal.name = this.mealInfo.value.title;

    this.specificMeal.weekTitle = this.mealInfo.value.weekTitle;
    this.specificMeal.overrideParticipants = this.mealInfo.value.overrideParticipants;
    this.specificMeal.participants = this.mealInfo.value.participants;

    return [this.meal, this.specificMeal];
  }

}
