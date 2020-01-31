import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl, MatSort } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

import { DatabaseService } from '../../_service/database.service';
import { Recipe } from '../../_class/recipe';
import { CreateRecipeComponent } from '../create-recipe/create-recipe.component';
import { Observable } from 'rxjs';
import { FirestoreRecipe } from '../../_interfaces/firestore-recipe';

export function CustomPaginator() {
  const customPaginatorIntl = new MatPaginatorIntl();
  customPaginatorIntl.itemsPerPageLabel = 'Rezepte pro Seite';
  customPaginatorIntl.getRangeLabel = ((page: number, pageSize: number, length: number) => {

    length = Math.max(length, 0);
    const startIndex = (page * pageSize === 0 && length !== 0) ? 1 : (page * pageSize + 1);
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = Math.min(startIndex - 1 + pageSize, length);
    return startIndex + ' bis ' + endIndex + ' von ' + length;
  });

  return customPaginatorIntl;
}

@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.component.html',
  styleUrls: ['./add-recipe.component.sass'],
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator() }
  ]
})
export class AddRecipeComponent implements AfterViewInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  // Datasource for the table
  public recipesTableSource = new MatTableDataSource<Recipe>();

  // only use for the mat table
  public readonly displayedColumns: string[] = ['select', 'name', 'description'];

  // Selected Recipes form the table
  public selectedRecipes = new SelectionModel<Recipe>(true, []);

  /** Constructor */
  constructor(private dbService: DatabaseService, public dialog: MatDialog) {

    this.recipesTableSource = new MatTableDataSource();

  }

  ngAfterViewInit() {

    // Eigenschaft für die Sortierung
    this.recipesTableSource.sort = this.sort;
    this.recipesTableSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'name': return item.name.toLowerCase();
        case 'description': return (item.description !== null) ? item.description.toLowerCase() : '';
        default: return item[property];
      }
    };

    this.dbService.getEditableRecipes().subscribe((recipes: Recipe[]) =>
      this.recipesTableSource.data = recipes);

    this.recipesTableSource.paginator = this.paginator;


  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selectedRecipes.selected.length;
    const numRows = this.recipesTableSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selectedRecipes.clear() :
      this.recipesTableSource.data.forEach(user => this.selectedRecipes.select(user));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(recipe?: Recipe): string {
    if (!recipe) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectedRecipes.isSelected(recipe) ? 'deselect' : 'select'} row ${recipe.name}`;
  }

  /**
   * Öffnent den Dialog für, um eine neue Mahlzeit zu erstellen.
   */
  public newRecipe() {

    this.dialog.open(CreateRecipeComponent, {
      height: '640px',
      width: '900px',
      data: null

    }).afterClosed().subscribe((recipe: Observable<FirestoreRecipe>) => {

      recipe.subscribe(recipeData => this.dbService.addDocument(recipeData, 'recipes'));

      this.setFocusToSeachField();

    });


  }

  public setFocusToSeachField() {

    document.getElementById('search-field').focus();

  }


  applyFilter(filterValue: string) {
    this.recipesTableSource.filterPredicate = (recipe: Recipe, filter: string) =>
      // Condition for the filter
      recipe.name.trim().toLowerCase().includes(filter) ||
      recipe.description.trim().toLowerCase().includes(filter);

    // apply filter to the table
    this.recipesTableSource.filter = filterValue.trim().toLowerCase();
  }

}
