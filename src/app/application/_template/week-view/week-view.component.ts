import { SelectionModel } from '@angular/cdk/collections';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { firestore } from 'firebase';
import { Camp } from '../../_class/camp';
import { Day } from '../../_class/day';
import { Meal } from '../../_class/meal';
import { FirestoreMeal } from '../../_interfaces/firestore-meal';
import { AddMealComponent } from '../add-meal/add-meal.component';
import { AuthenticationService } from '../../_service/authentication.service';

@Component({
  selector: 'app-week-view',
  templateUrl: './week-view.component.html',
  styleUrls: ['./week-view.component.sass']
})
export class WeekViewComponent implements OnInit {

  @Input() camp: Camp;

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

  protected mealsChanged: boolean = false;

  /**
   * 
   * @param event 
   */
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

    this.camp.pushToFirestoreDB();
    this.mealsChanged = false;

  }

  // TODO: 
  editDay(day: Day) {

    console.log('edit day:');
    console.log(day);

    this.dialog.open(EditDayComponent, {
      height: '400px',
      width: '700px',
      data: { name: day }

    }).afterClosed().subscribe((save: number) => {

      if (save == 1) {
        this.mealsChanged = true;
      }

      // delete
      else if (save == -1) {
        this.camp.days.splice(this.camp.days.indexOf(day), 1);

        this.camp.pushToFirestoreDB();

      }

    });

  }


  addNewDay() {

    let date = new Date(this.camp.days[this.camp.days.length - 1].dateAsTypeDate);
    date.setDate(date.getDate() + 1);

    let day = new Day({
      date: firestore.Timestamp.fromDate(date),
      description: "",
      meals: []
    }, this.camp);

    this.camp.days.push(day);
    this.camp.pushToFirestoreDB();

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

          result.selected.forEach(firestoreMeal => {

            let meal = new Meal(
              {
                description: firestoreMeal.title,
                title: firestoreMeal["usedAs"] ? firestoreMeal["usedAs"] : 'Zmorgen',
                access: null,
                firestoreElementId: firestoreMeal.firestoreElementId
              },
              firestoreMeal.firestoreElementId,
              this.camp.FIRESTORE_DATABASE);

            meal.createSpecificData(this.camp);

            this.camp.days[0].meals.push(meal);

            this.camp.pushToFirestoreDB();

          });

        }

      });

  }


}



@Component({
  templateUrl: './edit-day.component.html',
  styleUrls: ['./edit-day.component.sass']
})
export class EditDayComponent implements OnInit {

  private dayInfo: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data, private formBuilder: FormBuilder) { }

  ngOnInit() {



    this.dayInfo = this.formBuilder.group({

      description: this.data.name.description,
      date: this.data.name.dateAsTypeDate

    });

  }

  delete() {

    this.data.name

  }

  saveDayData() {

    this.data.name.dateAsTypeDate = this.dayInfo.value.date;
    this.data.name.description = this.dayInfo.value.description;

  }

}
