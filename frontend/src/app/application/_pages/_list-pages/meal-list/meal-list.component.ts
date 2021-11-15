import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {mergeMap, take} from 'rxjs/operators';
import {Meal} from '../../../_class/meal';
import {DeepCopyMealComponent} from '../../../_dialoges/deep-copy-meal/deep-copy-meal.component';
import {DatabaseService} from '../../../_service/database.service';
import {TileListPage} from '../../tile_page';
import {CreateMealComponent} from '../../../_dialoges/create-meal/create-meal.component';
import {Observable} from 'rxjs';
import {FirestoreMeal} from '../../../_interfaces/firestoreDatatypes';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {HeaderNavComponent} from '../../../../_template/header-nav/header-nav.component';
import {ImportComponent} from '../../../_dialoges/import/import.component';

@Component({
  selector: 'app-meal-list',
  templateUrl: './meal-list.component.html',
  styleUrls: ['./meal-list.component.sass']
})
export class MealListComponent extends TileListPage<Meal> implements OnInit {

  constructor(
    private dbService: DatabaseService,
    public snackBar: MatSnackBar,
    private route: ActivatedRoute,
    public dialog: MatDialog) {

    super(dbService, snackBar, dbService.getAccessableMeals(), dialog);

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

    this.addButtonNew();

    setTimeout(() =>
      this.route.queryParams.subscribe(params => {

        const usesParameter = params.includes;

        if (usesParameter) {

          (document.getElementById('search-field') as HTMLFormElement).value = 'includes: ' + usesParameter;
          this.applyFilter('includes: ' + usesParameter);
          console.log(params);

        }

      }), 250);

    HeaderNavComponent.addToHeaderNav({
      active: true,
      description: 'Import aus einer externen Quelle',
      name: 'Mahlzeit Importieren',
      action: (() => this.import()),
      icon: 'system_update_alt',
    });

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
