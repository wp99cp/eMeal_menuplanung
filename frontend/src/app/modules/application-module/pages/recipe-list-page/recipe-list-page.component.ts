import {Component, OnInit} from '@angular/core';
import {filter, mergeMap, take} from 'rxjs/operators';
import {Recipe} from '../../classes/recipe';
import {CopyRecipeComponent} from '../../dialoges/copy-recipe/copy-recipe.component';
import {CreateRecipeComponent} from '../../dialoges/create-recipe/create-recipe.component';
import {DatabaseService} from '../../services/database.service';
import {TileListPage} from '../tile_page';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {FirestoreRecipe} from "../../interfaces/firestoreDatatypes";
import {Observable} from "rxjs";

@Component({
  selector: 'app-recipe-list-page',
  templateUrl: './recipe-list-page.component.html',
  styleUrls: ['./recipe-list-page.component.sass']
})
export class RecipeListPageComponent extends TileListPage<Recipe> implements OnInit {


  constructor(
    private dbService: DatabaseService,
    private snackBar: MatSnackBar,
    public route: ActivatedRoute,
    dialog: MatDialog) {

    super(dbService, snackBar, dbService.getAccessableRecipes(route.queryParams), dialog);


    // set filter for searching
    this.filterFn = (rec: Recipe) => rec.name.toLocaleLowerCase().includes(this.filterValue.toLocaleLowerCase());
    this.dbElementName = 'Rezept';

  }


  ngOnInit(): void {

    this.route.queryParams.subscribe(() => {
      setTimeout(() => this.addButtonNew(), 0);
    })

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
      .pipe(filter(recipeData => recipeData !== undefined))
      .pipe(mergeMap((recipe: Observable<FirestoreRecipe>) => recipe))
      .pipe(take(1))
      .subscribe(recipeData => {
        console.log(recipeData)
        this.dbService.addDocument(recipeData, 'recipes')
      });

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
