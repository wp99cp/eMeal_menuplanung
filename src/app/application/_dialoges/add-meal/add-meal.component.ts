import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl, MatSort } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';

import { Meal } from '../../_class/meal';
import { CreateMealComponent } from '../../_dialoges/create-meal/create-meal.component';
import { FirestoreMeal, MealUsage } from '../../_interfaces/firestoreDatatypes';
import { AuthenticationService } from '../../_service/authentication.service';
import { DatabaseService } from '../../_service/database.service';
import { CustomPaginator } from './CustomPaginator';

@Component({
  selector: 'app-add-meal',
  templateUrl: './add-meal.component.html',
  styleUrls: ['./add-meal.component.sass'],
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator() }
  ]
})
export class AddMealComponent implements AfterViewInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  // Datasource for the table
  public mealTableSource = new MatTableDataSource<Meal>();

  // only use for the mat table
  public readonly displayedColumns: string[] = ['select', 'name', 'description', 'useAs'];

  // Selected Meals form the table
  public selectedMeal = new SelectionModel<Meal>(true, []);

  /** Constructor */
  constructor(private dbService: DatabaseService, public dialog: MatDialog, private authService: AuthenticationService) {

    this.mealTableSource = new MatTableDataSource();


  }

  ngAfterViewInit() {

    // Eigenschaft für die Sortierung
    this.mealTableSource.sort = this.sort;
    this.mealTableSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'name': return item.name.toLowerCase();
        case 'description': return (item.description !== null) ? item.description.toLowerCase() : '';
        case 'useAs': return (item.lastMeal !== undefined) ? item.lastMeal.toLowerCase() : '';
        default: return item[property];
      }
    };

    this.dbService.getEditableMeals().subscribe((meals: Meal[]) => {
      meals.forEach(meal => meal.usedAs = meal.lastMeal);
      this.mealTableSource.data = meals;
    });

    this.mealTableSource.paginator = this.paginator;


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
      this.mealTableSource.data.forEach(meal => this.selectedMeal.select(meal));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(meal?: Meal): string {
    if (!meal) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectedMeal.isSelected(meal) ? 'deselect' : 'select'} row ${meal.name}`;
  }

  /** Set usedAs parameter to firestoreMeal */
  selected(meal: Meal, usedAs: MealUsage) {

    meal.usedAs = usedAs;

  }

  /**
   * Setzt das Feld lastMeal und speichet die Mahlzeit.
   * LastMeal wird speichert somit den letzten Wert der Verwendung einer Mahlzeit.
   */
  addLastMeal() {

    this.selectedMeal.selected.forEach(meal => {

      meal.lastMeal = meal.usedAs;
      this.dbService.updateDocument(meal);

    });

  }

  /**
   * Öffnent den Dialog für, um eine neue Mahlzeit zu erstellen.
   */
  public newMeal() {

    this.dialog.open(CreateMealComponent, {
      height: '640px',
      width: '900px',
      data: { mealName: (document.getElementById('search-field') as HTMLInputElement).value }

    }).afterClosed().subscribe((meal: Observable<FirestoreMeal>) => {

      meal.subscribe(mealData => this.dbService.addDocument(mealData, 'meals'));

      this.setFocusToSeachField();

    });
  }

  public setFocusToSeachField() {

    document.getElementById('search-field').focus();

  }


  applyFilter(filterValue: string) {

    document.getElementById('add-meal').classList.remove('mat-save');

    this.mealTableSource.filterPredicate = (meal: Meal, filter: string) =>
      // Condition for the filter
      meal.name.trim().toLowerCase().includes(filter) ||
      meal.description.trim().toLowerCase().includes(filter) ||
      (meal.keywords !== undefined && meal.keywords.includes(filter)) ||
      (meal.lastMeal !== undefined && meal.lastMeal.trim().toLowerCase().includes(filter));

    // apply filter to the table
    this.mealTableSource.filter = filterValue.trim().toLowerCase();

    if (this.mealTableSource.filteredData.length === 0) {

      document.getElementById('add-meal').classList.add('mat-save');

    }
  }

  /**
   * öffnet den Import Dialog
   */
  public import() {

    throw new Error('Not yet implemented!');

    /*

    this.dialog.open(ImportComponent, {
      height: '640px',
      width: '900px',
      data: null
    }).afterClosed()
      .subscribe((result: Meal) => {

        this.authService.getCurrentUser().subscribe(user => {

          const document = result.toFirestoreDocument();
          const access: AccessData = { [user.uid as string]: 'owner' };
          document.access = access;
          this.dbService.addDocument(document, 'meals').then(doc => {

            result.recipes.subscribe(recipes => {

              recipes.forEach(recipe => {

                const recipeData = recipe.toFirestoreDocument();
                recipeData.access = access;
                this.dbService.addDocument(recipeData, 'meals/' + doc.id + '/recipes');

              });
            });

          });

        });

        this.setFocusToSeachField();

      });

      */
  }

}
