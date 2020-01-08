import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl, MatSort } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

import { Meal } from '../../_class/meal';
import { AccessData } from '../../_interfaces/accessData';
import { FirestoreMeal } from '../../_interfaces/firestore-meal';
import { AuthenticationService } from '../../_service/authentication.service';
import { DatabaseService } from '../../_service/database.service';
import { ImportComponent } from '../import/import.component';

export function CustomPaginator() {
  const customPaginatorIntl = new MatPaginatorIntl();
  customPaginatorIntl.itemsPerPageLabel = 'Mahlzeiten pro Zeite';
  customPaginatorIntl.getRangeLabel = ((page: number, pageSize: number, length: number) => {

    length = Math.max(length, 0);
    const startIndex = (page * pageSize === 0 && length !== 0) ? 1 : page * pageSize;
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = Math.min(startIndex - 1 + pageSize, length);
    return startIndex + ' bis ' + endIndex + ' von ' + length;
  });

  return customPaginatorIntl;
}


@Component({
  selector: 'app-add-meal',
  templateUrl: './add-meal.component.html',
  styleUrls: ['./add-meal.component.sass'],
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator() }
  ]
})

// TODO: fix bug, deselect nach der Auswahl der Verwendung...

export class AddMealComponent implements AfterViewInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  // Datasource for the table
  public mealTableSource = new MatTableDataSource<FirestoreMeal>();

  // only use for the mat table
  public readonly displayedColumns: string[] = ['select', 'title', 'description', 'useAs'];

  // Selected Meals form the table
  public selectedMeal = new SelectionModel<FirestoreMeal>(true, []);

  /** Constructor */
  constructor(private databaseService: DatabaseService, public dialog: MatDialog, private authService: AuthenticationService) {

    this.mealTableSource = new MatTableDataSource();


  }

  ngAfterViewInit() {

    // Eigenschaft für die Sortierung
    this.mealTableSource.sort = this.sort;
    this.mealTableSource.sortingDataAccessor = (item, property) => {
      console.log('sort')
      switch (property) {
        case 'title': return item.title.toLowerCase();
        case 'description': return (item.description !== null) ? item.description.toLowerCase() : '';
        default: return item[property];
      }
    };

    this.databaseService.getEditableMeals().subscribe((meals: FirestoreMeal[]) => {
      this.mealTableSource.data = (meals);
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
      meal.title.trim().toLowerCase().includes(filter) ||
      meal.description.trim().toLowerCase().includes(filter) ||
      (meal.keywords !== undefined && meal.keywords.trim().toLowerCase().includes(filter));

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
