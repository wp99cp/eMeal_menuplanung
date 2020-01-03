import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FirestoreMeal } from '../../_interfaces/firestore-meal';
import { DatabaseService } from '../../_service/database.service';
import { MatDialog } from '@angular/material/dialog';
import { ImportComponent } from '../import/import.component';
import { Meal } from '../../_class/meal';
import { AccessData } from '../../_interfaces/accessData';
import { AuthenticationService } from '../../_service/authentication.service';
import { Recipe } from '../../_class/recipe';


@Component({
  selector: 'app-add-meal',
  templateUrl: './add-meal.component.html',
  styleUrls: ['./add-meal.component.sass']
})

// TODO: fix bug, deselect nach der Auswahl der Verwendung...

export class AddMealComponent implements OnInit {


  // Datasource for the table
  public mealTableSource = new MatTableDataSource<FirestoreMeal>();

  // only use for the mat table
  public readonly displayedColumns: string[] = ['select', 'useAs', 'title', 'description'];

  // Selected Meals form the table
  public selectedMeal = new SelectionModel<FirestoreMeal>(true, []);

  /** Constructor */
  constructor(private databaseService: DatabaseService, public dialog: MatDialog, private authService: AuthenticationService) { }

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

    firestoreMeal.usedAs = usedAs;

  }

  newMeal() {

    this.databaseService.addNewMeal();

  }

 
  applyFilter(filterValue: string) {
    this.mealTableSource.filterPredicate = (meal: FirestoreMeal, filter: string) =>
      // Condition for the filter
      meal.title.trim().toLowerCase().includes(filter) || meal.description.trim().toLowerCase().includes(filter);

    // apply filter to the table
    this.mealTableSource.filter = filterValue.trim().toLowerCase();
  }


  import() {

    this.dialog.open(ImportComponent, {
      height: '640px',
      width: '900px',
      data: null
    }).afterClosed()
      .subscribe((result: Meal) => {

        console.log(Meal.getCollectionPath());

        this.authService.getCurrentUser().subscribe(user => {

          const document = result.extractDataToJSON();
          const access: AccessData = { owner: [user.uid as string], editor: [] };
          document.access = access;
          this.databaseService.addDocument(document, 'meals').then(doc => {

            console.log(doc.id);

            result.recipes.subscribe(recipes => {

              recipes.forEach(recipe => {

                const recipeData = recipe.extractDataToJSON();
                recipeData.access = { owner: [user.uid as string], editor: [] };
                this.databaseService.addDocument(recipeData, 'meals/' + doc.id + '/recipes');

              });
            });

          });

        });
      });

  }

}
