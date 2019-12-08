import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FirestoreMeal } from '../../_interfaces/firestore-meal';
import { DatabaseService } from '../../_service/database.service';


@Component({
  selector: 'app-add-meal',
  templateUrl: './add-meal.component.html',
  styleUrls: ['./add-meal.component.sass']
})
export class AddMealComponent implements OnInit {


  // Datasource for the table
  public mealTableSource = new MatTableDataSource<FirestoreMeal>();
  // only use for the mat table 
  public readonly displayedColumns: string[] = ['select', 'useAs', 'title', 'description'];

  // Selected Meals form the table
  public selectedMeal = new SelectionModel<FirestoreMeal>(true, []);

  /** Constructor */
  constructor(private databaseService: DatabaseService) { }

  /** on init */
  ngOnInit(): void {

    this.databaseService.getEditableMeals()
      .subscribe((meals: FirestoreMeal[]) => {
        this.mealTableSource = new MatTableDataSource<FirestoreMeal>(meals);
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

    firestoreMeal['usedAs'] = usedAs;

  }

}
