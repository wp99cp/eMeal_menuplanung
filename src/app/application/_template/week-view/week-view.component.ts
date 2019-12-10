import { SpecificMeal } from './../../_class/specific-meal';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firestore } from 'firebase';
import { Camp } from '../../_class/camp';
import { Day } from '../../_class/day';
import { Meal } from '../../_class/meal';
import { FirestoreMeal } from '../../_interfaces/firestore-meal';
import { DatabaseService } from '../../_service/database.service';
import { AddMealComponent } from '../add-meal/add-meal.component';
import { EditDayComponent } from '../edit-day/edit-day.component';

@Component({
  selector: 'app-week-view',
  templateUrl: './week-view.component.html',
  styleUrls: ['./week-view.component.sass']
})
export class WeekViewComponent implements OnInit {

  public mealsChanged = false;
  @Input() camp: Camp;

  constructor(public dialog: MatDialog, public databaseService: DatabaseService) { }

  ngOnInit() { }

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


  editDay(day: Day) {

    console.log('edit day:');
    console.log(day);

    this.dialog.open(EditDayComponent, {
      height: '400px',
      width: '700px',
      data: { name: day }

    }).afterClosed().subscribe((save: number) => {

      if (save === 1) {
        this.mealsChanged = true;
      } else if (save === -1) {
        this.camp.days.splice(this.camp.days.indexOf(day), 1);

        this.saveCamp();

      }

    });

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
      height: '640px',
      width: '900px',
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
            meal.createSpecificData(this.databaseService, this.camp);

            this.camp.days[0].meals.push(meal);

            this.saveCamp();

          });

        }

      });

  }


}
