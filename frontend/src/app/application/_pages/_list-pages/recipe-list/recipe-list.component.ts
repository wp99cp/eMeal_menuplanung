import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {mergeMap, take} from 'rxjs/operators';
import {Recipe} from '../../../_class/recipe';
import {CopyRecipeComponent} from '../../../_dialoges/copy-recipe/copy-recipe.component';
import {CreateRecipeComponent} from '../../../_dialoges/create-recipe/create-recipe.component';
import {FirestoreRecipe} from '../../../_interfaces/firestoreDatatypes';
import {DatabaseService} from '../../../_service/database.service';
import {TileListPage} from '../../tile_page';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {HelpService} from '../../../_service/help.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.sass']
})
export class RecipeListComponent extends TileListPage<Recipe> implements OnInit {


  constructor(
    private dbService: DatabaseService,
    private snackBar: MatSnackBar,
    dialog: MatDialog) {

    super(dbService, snackBar, dbService.getAccessableRecipes(), dialog);



    // set filter for searching
    this.filterFn = (rec: Recipe) => rec.name.toLocaleLowerCase().includes(this.filterValue.toLocaleLowerCase());
    this.dbElementName = 'Rezept';

  }


  ngOnInit(): void {

    this.addButtonNew();

  }

  public copy(element: Recipe) {

    this.dialog.open(CopyRecipeComponent, {width: '530px', height: '250px'})
      .afterClosed().subscribe((result: string) => {
      if (result === 'copy') {
        this.dbService.createCopy(element);
      }
    });

  }

  /**
   * Öffnent den Dialog für, um eine neue Mahlzeit zu erstellen.
   *
   */
  public newElement() {

    this.dialog.open(CreateRecipeComponent, {
      height: '640px',
      width: '900px',
      data: {recipeName: ''}
    }).afterClosed()
      .pipe(
        mergeMap((recipe: Observable<FirestoreRecipe>) => recipe),
        take(1)
      ).subscribe(recipeData => this.dbService.addDocument(recipeData, 'recipes'));

  }

  protected deleteElement(element: Recipe): void {

    this.dbService.deleteDocument(element);

  }

  protected async deleteConditions(element: Recipe): Promise<boolean> {

    // Rezept wird noch verwendet
    if (element.usedInMeals.length > 0) {
      this.snackBar.open('Das ' + this.dbElementName + ' kann nicht gelöscht werden, da es verwendet wird!', '', {duration: 2000});
      return false;
    }

    return true;

  }

}
