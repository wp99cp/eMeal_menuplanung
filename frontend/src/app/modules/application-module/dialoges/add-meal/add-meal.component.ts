import {SelectionModel} from '@angular/cdk/collections';
import {AfterViewInit, Component, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {MatTableDataSource} from '@angular/material/table';
import {Observable} from 'rxjs';

import {Meal} from '../../classes/meal';
import {CreateMealComponent} from '../create-meal/create-meal.component';
import {FirestoreMeal, MealUsage} from '../../interfaces/firestoreDatatypes';
import {DatabaseService} from '../../services/database.service';
import {CustomPaginator} from './CustomPaginator';
import {MatPaginator, MatPaginatorIntl} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {ImportComponent} from '../import/import.component';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-add-meal',
  templateUrl: './add-meal.component.html',
  styleUrls: ['./add-meal.component.sass'],
  providers: [
    {provide: MatPaginatorIntl, useValue: CustomPaginator()}
  ]
})
export class AddMealComponent implements AfterViewInit {

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  // Datasource for the table
  public mealTableSource = new MatTableDataSource<Meal>();

  // only use for the mat table
  public readonly displayedColumns: string[] = ['select', 'name', 'description', 'useAs'];

  // Selected Meals form the table
  public selectedMeal = new SelectionModel<Meal>(true, []);

  /** Constructor */
  constructor(
    private dbService: DatabaseService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { mealNames: string[], usage: MealUsage }) {

    this.mealTableSource = new MatTableDataSource();


  }

  ngAfterViewInit() {

    // Eigenschaft für die Sortierung
    this.mealTableSource.sort = this.sort;

    this.mealTableSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'name':
          return item.name.toLowerCase() + this.defaultSort(item);
        case 'description':
          return (item.description !== null) ? item.description.toLowerCase() : '';
        case 'useAs':
          return (item.lastMeal !== undefined) ? item.lastMeal.toLowerCase() : '';
        default:
          return this.defaultSort(item);
      }
    };

    this.dbService.getEditableMeals().subscribe((meals: Meal[]) => {
      meals.forEach(meal => meal.usedAs = meal.lastMeal);
      this.mealTableSource.data = meals;
    });

    this.mealTableSource.paginator = this.paginator;


  }

  /**
   * Whether the number of selected elements matches the total number of rows.
   * Since you only can select meals with a setted useage, we only need to count them...
   *
   */
  isAllSelected() {
    const numSelected = this.selectedMeal.selected.length;
    const numRows = this.mealTableSource.data.filter(meal => meal.usedAs != null).length;
    return numSelected === numRows;
  }

  /**
   * Selects all rows if they are not all selected; otherwise clear selection.
   * only meals with a set usage gets selected
   *
   */
  masterToggle() {
    this.isAllSelected() ?
      this.selectedMeal.clear() :
      this.mealTableSource.data.filter(meal => meal.usedAs != null).forEach(meal => this.selectedMeal.select(meal));
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

      meal.lastMeal = this.data.usage ? this.data.usage : meal.usedAs;
      this.dbService.updateDocument(meal);

    });

  }

  /**
   * Öffnent den Dialog für, um eine neue Mahlzeit zu erstellen.
   *
   */
  public newMeal() {

    this.dialog.open(CreateMealComponent, {
      height: '640px',
      width: '900px',
      data: {mealName: (document.getElementById('search-field') as HTMLInputElement).value}

    }).afterClosed()
      .pipe(take(1))
      .subscribe((meal: Observable<FirestoreMeal>) => {

        meal.subscribe(mealData => this.dbService.addDocument(mealData, 'meals'));
        this.setFocusToSeachField();

        // Remove Color
        document.getElementById('add-meal').classList.remove('mat-save');

        if (this.sort.active === 'title') {

          (document.getElementById('search-field') as HTMLInputElement).value = '';
          this.applyFilter('');
        }

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

    this.dialog.open(ImportComponent, {
      height: '640px',
      width: '900px',
    }).afterClosed().subscribe();

  }

  /**
   * Defines the default sorting order of the meals.
   * Hierfür bekommt jede Mahlzeit eine Zahl zugeordnet.
   *
   * @param item meal to order
   */
  private defaultSort(meal: Meal): string | number {

    // Bereits verwendete Mahlzeiten werden ganz nach hinten verschoben. Ausser
    // es handelt sich dabei um einem Zmorgen, Zvieri oder Znüni
    if (this.data.mealNames.includes(meal.name)
      && !['Zmorgen', 'Zvieri', 'Znüni'].includes(meal.usedAs)) {
      return 0;
    }

    // ansonsten werden die Mahlzeiten nach dem Datum sortiert,
    // so dass das zuletzt verwendete zuoberst ist.
    return -meal.lastChange.getTime();

  }

}
