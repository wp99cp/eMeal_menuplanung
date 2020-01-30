import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Camp } from '../../_class/camp';
import { SpecificMeal } from '../../_class/specific-meal';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Meal } from '../../_class/meal';

@Component({
  selector: 'app-meal-info',
  templateUrl: './meal-info.component.html',
  styleUrls: ['./meal-info.component.sass']
})
export class MealInfoComponent {

  public mealInfo: FormGroup;

  public camp: Camp;
  public specificMeal: SpecificMeal;
  public meal: Meal;

  constructor(@Inject(MAT_DIALOG_DATA) data: { camp: Camp, meal: Meal, specificMeal: SpecificMeal }, private formBuilder: FormBuilder) {

    this.camp = data.camp;
    this.specificMeal = data.specificMeal;
    this.meal = data.meal;

    this.mealInfo = this.formBuilder.group({

      title: this.meal.name,
      description: this.meal.description,

      // der weekTitle eines spezifischenMeal muss nicht zwingend gesetzt sein...
      // in diesem Fall wird der meal.title übernommen und bei der nächsten Speicherung abgespeichert
      weekTitle: this.specificMeal.weekTitle !== '' ? this.specificMeal.weekTitle : this.meal.name,
      overrideParticipants: this.specificMeal.overrideParticipants,
      participants: this.specificMeal.participants

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
