import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Meal } from '../../_class/meal';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators'
import { FirestoreMeal } from '../../_interfaces/firestore-meal';


@Component({
  selector: 'app-add-meal',
  templateUrl: './add-meal.component.html',
  styleUrls: ['./add-meal.component.sass']
})
export class AddMealComponent implements OnInit {


  private selection = new SelectionModel<FirestoreMeal>(true, []);
  private displayedColumns: string[] = ['select', 'title', 'description'];
  private mealList = new MatTableDataSource<FirestoreMeal>();

  constructor(private database: AngularFirestore) { }

  ngOnInit(): void {

    // TODO: very bad solution for get only once...
    let thisObserver = this.database.collection('meals',
      collRef => collRef.where('access.owner', "array-contains", 'ZmXlaYpCPWOLlxhIs4z5CMd27Rn2')).snapshotChanges()
      // Create new Users out of the data
      .pipe(map(docActions => docActions.map(docRef => docRef.payload.doc.data() as FirestoreMeal)))
      .subscribe((meals: FirestoreMeal[]) => {
        this.mealList = new MatTableDataSource<FirestoreMeal>(meals);
        thisObserver.unsubscribe();
      })

  }


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.mealList.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.mealList.data.forEach(user => this.selection.select(user));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(user?: FirestoreMeal): string {
    if (!user) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(user) ? 'deselect' : 'select'} row ${user.title}`;
  }


}