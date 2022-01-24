import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {mergeMap, take} from 'rxjs/operators';
import {Meal} from '../../classes/meal';
import {DeepCopyMealComponent} from '../../dialoges/deep-copy-meal/deep-copy-meal.component';
import {DatabaseService} from '../../services/database.service';
import {TileListPage} from '../tile_page';
import {CreateMealComponent} from '../../dialoges/create-meal/create-meal.component';
import {Observable} from 'rxjs';
import {FirestoreMeal} from '../../interfaces/firestoreDatatypes';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {ImportComponent} from '../../dialoges/import/import.component';
import {HeaderNavComponent} from "../../../../shared/components/header-nav/header-nav.component";

@Component({
  selector: 'app-meal-list-page',
  templateUrl: './meal-list-page.component.html',
  styleUrls: ['./meal-list-page.component.sass']
})
export class MealListPageComponent extends TileListPage<Meal> implements OnInit {

  constructor(
    private dbService: DatabaseService,
    public snackBar: MatSnackBar,
    public route: ActivatedRoute,
    public dialog: MatDialog) {

    super(dbService, snackBar, dbService.getAccessableMeals(route.queryParams), dialog);

    // set filter for searching
    this.filterFn = (meal) => (this.filterDocIDs.length === 0 || this.filterDocIDs.includes(meal.documentId)) &&
      meal.name.toLocaleLowerCase().includes(this.filterValue.toLocaleLowerCase());

    this.dbElementName = 'Mahlzeit';

  }

  import() {

    this.dialog.open(ImportComponent, {
      height: '618px',
      width: '1000px'
    }).afterClosed().subscribe();

  }

  ngOnInit() {

    this.route.queryParams.subscribe(() => {
      setTimeout(() => {
        this.addButtonNew();

        HeaderNavComponent.addToHeaderNav({
          active: true,
          description: 'Import aus einer externen Quelle',
          name: 'Mahlzeit Importieren',
          action: (() => this.import()),
          icon: 'system_update_alt',
        });

      }, 0);
    })

    setTimeout(() =>
      this.route.queryParams.subscribe(params => {

        const usesParameter = params.includes;

        if (usesParameter) {

          (document.getElementById('search-field') as HTMLFormElement).value = 'includes: ' + usesParameter;
          this.applyFilter('includes: ' + usesParameter);
          console.log(params);

        }

      }), 250);

  }


  applyFilter(event: string) {

    if (event.includes('includes:')) {
      const recipeId = event.substr(event.indexOf(':') + 1).trim();
      this.dbService.getMealIDsThatIncludes(recipeId).subscribe(mealIds =>
        super.applyFilter('', mealIds), err => super.applyFilter(''));
    } else {
      super.applyFilter(event);
    }

  }

  copy(meal: Meal) {

    this.dialog.open(DeepCopyMealComponent, {
      width: '520px',
      height: '275px',
      data: meal
    }).afterClosed()
      .subscribe(async result => {

        const oldMealId = meal.documentId;

        if (result === 'deep') {

          const newMealId = (await this.dbService.createCopy(meal)).id;

          // add id of the new meal to the used_in_meal of the new recipes
          this.dbService.getRecipes(oldMealId)
            .pipe(take(1))
            .subscribe(recipes => recipes.forEach(recipe =>
              this.dbService.createCopy(recipe, newMealId)
            ));

        } else if (result === 'deep-template') {

          const newMealId = (await this.dbService.createCopy(meal)).id;
          this.dbService.linkOrCopyRecipes(oldMealId, newMealId);

        } else if (result === 'copy') {

          // add id of new meal to used_in_meals field of the old recipes
          const newMealId = (await this.dbService.createCopy(meal)).id;
          this.dbService.addIdToRecipes(oldMealId, newMealId);

        }
      });

  }

  public newElement() {

    this.dialog.open(CreateMealComponent, {
      height: '640px',
      width: '900px',
      data: {mealName: ''}
    }).afterClosed()
      .pipe(
        mergeMap((meal: Observable<FirestoreMeal>) => meal),
        take(1))
      .subscribe(mealData => this.dbService.addDocument(mealData, 'meals'));

  }

  protected async deleteConditions(element: Meal): Promise<boolean> {

    return new Promise(resolve => this.dbService.getNumberOfUses(element.documentId).subscribe(numb => {

      if (numb !== 0) {
        this.snackBar.open('Das Rezept kann nicht gelöscht werden, da es noch verwendet wird!', '', {duration: 2000});
      }

      resolve(numb === 0);

    }));

  }

  protected deleteElement(element: Meal): void {
    this.dbService.deleteRecipesRefs(element.documentId);
    this.dbService.deleteDocument(element);
  }

}
