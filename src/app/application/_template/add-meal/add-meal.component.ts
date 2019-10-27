import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatTableDataSource } from '@angular/material/table';
import { map, first } from 'rxjs/operators';
import { FirestoreMeal } from '../../_interfaces/firestore-meal';
import { AuthenticationService } from '../../_service/authentication.service';


@Component({
  selector: 'app-add-meal',
  templateUrl: './add-meal.component.html',
  styleUrls: ['./add-meal.component.sass']
})
export class AddMealComponent implements OnInit {


  // Datasource for the table
  private mealTableSource = new MatTableDataSource<FirestoreMeal>();
  // only use for the mat table 
  protected readonly displayedColumns: string[] = ['select', 'useAs', 'title', 'description'];

  // Selected Meals form the table
  private selectedMeal = new SelectionModel<FirestoreMeal>(true, []);

  /** Constructor */
  constructor(private database: AngularFirestore, private auth: AuthenticationService) { }

  /** on init */
  ngOnInit(): void {

    this.auth.fireAuth.authState.pipe(first()).subscribe(user => {

      // TODO: very bad solution for get only once...
      let observerMeals = this.database.collection('meals',
        collRef => collRef.where('access.owner', "array-contains", user.uid)).snapshotChanges()
        // Create new Users out of the data
        .pipe(map(docActions => docActions.map(docRef => {

          let meal = docRef.payload.doc.data() as FirestoreMeal;
          meal.firestoreElementId = docRef.payload.doc.id;
          return meal;

        })))
        .subscribe((meals: FirestoreMeal[]) => {
          this.mealTableSource = new MatTableDataSource<FirestoreMeal>(meals);
          observerMeals.unsubscribe();
        })


    });

  }


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selectedMeal.selected.length;
    const numRows = this.mealTableSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selectedMeal.clear() :
      this.mealTableSource.data.forEach(user => this.selectedMeal.select(user));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(user?: FirestoreMeal): string {
    if (!user) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectedMeal.isSelected(user) ? 'deselect' : 'select'} row ${user.title}`;
  }

  /** Set usedAs parameter to firestoreMeal */
  selected(firestoreMeal: FirestoreMeal, usedAs: string) {

    firestoreMeal["usedAs"] = usedAs;

  }
}