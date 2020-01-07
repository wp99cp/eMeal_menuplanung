import { SelectionModel } from '@angular/cdk/collections';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Input, OnChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firestore } from 'firebase';

import { Camp } from '../../_class/camp';
import { Day } from '../../_class/day';
import { Meal } from '../../_class/meal';
import { FirestoreMeal } from '../../_interfaces/firestore-meal';
import { Saveable } from '../../_service/auto-save.service';
import { DatabaseService } from '../../_service/database.service';
import { AddMealComponent } from '../add-meal/add-meal.component';
import { EditDayComponent } from '../edit-day/edit-day.component';

@Component({
  selector: 'app-week-view',
  templateUrl: './week-view.component.html',
  styleUrls: ['./week-view.component.sass']
})
// TODO: verwendung einer Mahlzeit (Zmorgen, Zmittag, ...) kann nachträglich geändert werden
// add custom Tag für Verwendung (z.B Vorbereiten...)

export class WeekViewComponent implements OnChanges, Saveable {

  public colCounter = this.calculateCols();

  public mealsChanged = false;
  public showParticipantsWarning = false;
  @Input() camp: Camp;

  constructor(public dialog: MatDialog, public databaseService: DatabaseService) {

    // change number of collums when resize window
    window.addEventListener('resize', () => this.colCounter = this.calculateCols());

  }


  /**
   * updates the participantsWarning
   */
  ngOnChanges() {


    this.showParticipantsWarning = false;
    this.camp.days.forEach(day => day.meals.forEach(meal => {
      this.showParticipantsWarning = this.showParticipantsWarning || meal.participantsWarning;
    }));

  }

  public async save() {

    if (this.mealsChanged) {
      console.log('Autosave camp');
      this.saveMeals();
      return true;
    }

    return false;
  }

  drop(event: CdkDragDrop<string[]>) {

    this.mealsChanged = true;

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  /** Speichert das Lager ab */
  saveMeals() {

    this.saveCamp();
    this.mealsChanged = false;

  }


  addNewDay() {

    const date = new Date(this.camp.days[this.camp.days.length - 1].dateAsTypeDate);
    date.setDate(date.getDate() + 1);

    const day = new Day({
      date: firestore.Timestamp.fromDate(date),
      description: '',
      meals: []
    }, this.camp);

    this.camp.days.push(day);

    this.saveCamp();

  }


  private saveCamp() {

    this.databaseService.updateDocument(this.camp.extractDataToJSON(), this.camp.getDocPath());

  }

  /**
   *
   */
  addMeal() {


    this.dialog.open(AddMealComponent, {
      height: '618px',
      width: '1000px',
      data: null
    }).afterClosed()
      .subscribe((result: SelectionModel<FirestoreMeal>) => {

        if (result != null) {

          result.selected.forEach(async firestoreMeal => {

            const meal = new Meal(
              {
                description: firestoreMeal.title,
                title: firestoreMeal.usedAs ? firestoreMeal.usedAs : 'Zmorgen',
                firestoreElementId: firestoreMeal.firestoreElementId
              },
              firestoreMeal.firestoreElementId);


            const specificMealId = await meal.createSpecificMeal(this.databaseService, this.camp);
            meal.setSpecificMeal(specificMealId);
            meal.createSpecificRecipes(this.databaseService, this.camp);

            this.camp.days[0].meals.push(meal);
            this.saveCamp();

          });

        }

      });

  }


  public deleteMeal(mealId: string, specificMealId: string) {

    this.camp.removeMeal(specificMealId);
    this.saveCamp();
    this.databaseService.deleteSpecificMealAndRecipes(mealId, specificMealId);

  }

  public editDay(save: number, day: Day) {


    if (save === 1) {
      this.mealsChanged = true;

    } else if (save === -1) {

      this.camp.days.splice(this.camp.days.indexOf(day), 1);

      day.meals.forEach(meal => {

        this.databaseService.deleteSpecificMealAndRecipes(meal.firestoreElementId, meal.specificId);

      });

      this.save();

    }





  }

  private calculateCols() {

    return Math.floor(document.body.scrollWidth / 360);
  }


}
