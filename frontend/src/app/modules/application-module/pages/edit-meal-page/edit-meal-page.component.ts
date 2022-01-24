import {SelectionModel} from '@angular/cdk/collections';
import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {empty, Observable} from 'rxjs';
import {map, mergeMap, shareReplay, switchMap, take, tap} from 'rxjs/operators';

import {Camp} from '../../classes/camp';
import {Meal} from '../../classes/meal';
import {Recipe} from '../../classes/recipe';
import {SpecificMeal} from '../../classes/specific-meal';
import {SpecificRecipe} from '../../classes/specific-recipe';
import {AddRecipeComponent} from '../../dialoges/add-recipe/add-recipe.component';
import {MealInfoComponent} from '../../dialoges/meal-info/meal-info.component';
import {MealPrepareComponent} from '../../dialoges/meal-prepare/meal-prepare.component';
import {AutoSaveService, Saveable} from '../../services/auto-save.service';
import {DatabaseService} from '../../services/database.service';
import {SettingsService} from '../../services/settings.service';
import {EditRecipeInCampComponent} from '../../components/edit-recipe-in-camp/edit-recipe-in-camp.component';
import {MatDialog} from '@angular/material/dialog';
import {SwissDateAdapter} from "../../../../shared/utils/format-datapicker";
import {CurrentlyUsedMealService} from "../../../../services/currently-used-meal.service";
import {HeaderNavComponent} from "../../../../shared/components/header-nav/header-nav.component";

@Component({
  selector: 'app-edit-meal-page',
  templateUrl: './edit-meal-page.component.html',
  styleUrls: ['./edit-meal-page.component.sass']
})
export class EditMealPageComponent implements OnInit, Saveable {

  public camp: Observable<Camp | undefined>;
  public meal: Observable<Meal>;
  public specificMeal: Observable<SpecificMeal>;
  public recipes: Observable<Recipe[]>;
  public specificRecipes: Observable<SpecificRecipe[]>;
  public indexOfOpenedPanel = -1;
  public calcMealPart = SettingsService.calcMealParticipants;
  @ViewChildren(EditRecipeInCampComponent) editRecipes: QueryList<EditRecipeInCampComponent>;
  public showOverwirtes = true;
  private urlPathData: Observable<string[]>;

  constructor(
    private route: ActivatedRoute,
    public dbService: DatabaseService,
    public dialog: MatDialog,
    private router: Router,
    public swissDateAdapter: SwissDateAdapter,
    private autosave: AutoSaveService,
    private lastUsedService: CurrentlyUsedMealService) {


    autosave.register(this);

  }

  /**
   * returns the url segment based on a search of the parent directory.
   *
   * @param parentDirectory name of the parent directory
   * @param offset form the parent directory
   */
  loadIDFromURL(parentDirectory: string, offset = 1) {
    return (source: Observable<string[]>): Observable<string | undefined> => {
      return source.pipe(map(segments =>
        segments.includes(parentDirectory) && segments.length > segments.indexOf(parentDirectory) + offset ?
          segments[segments.indexOf(parentDirectory) + offset] : undefined));
    };
  }

  public newOpened(index: number) {

    this.indexOfOpenedPanel = index;

  }

  ngOnInit() {

    // load id's form the URL
    this.urlPathData = this.route.url.pipe(
      map(urlSegments => urlSegments.map(segment => segment.path)),
      tap(data => console.log(data)), // print on console
      shareReplay() // use the same data for all subscribers
    );

    this.camp = this.urlPathData.pipe(
      this.loadIDFromURL('camps'),
      switchMap(id => id !== undefined ? this.dbService.getCampById(id) : empty())
    );

    this.meal = this.urlPathData.pipe(this.loadIDFromURL('meals'),
      switchMap(id => id !== undefined ? this.dbService.getMealById(id) : empty())
    );

    this.specificMeal = this.urlPathData.pipe(
      this.loadIDFromURL('meals'),
      mergeMap(mealId =>
        this.urlPathData.pipe(
          this.loadIDFromURL('meals', 2),
          mergeMap(specificMealId => this.dbService.getSpecificMeal(mealId, specificMealId))
        )
      )
    );

    this.recipes = this.urlPathData.pipe(
      this.loadIDFromURL('meals'),
      mergeMap(mealId => this.dbService.getRecipes(mealId))
    );

    // set as last used
    this.camp
      .pipe(take(1))
      .subscribe(camp =>
      this.lastUsedService.addToHistory(camp)
    );

    this.camp.pipe(take(1)).subscribe(camp =>

      HeaderNavComponent.addToHeaderNav({
        active: true,
        description: 'Zurück zum ' + camp.name,
        name: camp.name,
        action: (() => this.router.navigate(['../../..'], {relativeTo: this.route})),
        separatorAfter: true
      }, 0)
    );

    HeaderNavComponent.addToHeaderNav({
      active: false,
      description: 'Änderungen speichern',
      name: 'Speichern',
      action: (() => this.saveButton()),
      icon: 'save',
    });

    HeaderNavComponent.addToHeaderNav({
      active: true,
      description: 'Informationen zur Mahlzeit',
      name: 'Mahlzeit',
      action: (() => this.mealInfoDialog()),
      icon: 'info',
    });

    HeaderNavComponent.addToHeaderNav({
      active: true,
      description: 'Rezept hinzufügen',
      name: 'Rezepte',
      action: (() => this.newRecipe()),
      icon: 'menu_book'
    });

    HeaderNavComponent.addToHeaderNav({
      active: true,
      description: 'An einem anderen Tag vorbereiten',
      name: 'Vorbereiten',
      action: (() => this.prepare()),
      icon: 'av_timer',
      separatorAfter: true
    });

    /*
    HeaderNavComponent.addToHeaderNav({
      active: true,
      description: 'Globale oder lokale Änderungen',
      name: 'Änderungen',
      action: (() => this.toggleChanges()),
      type: 'toggle',
      values: ['Nur dieses Lager', 'Vorlage']
    });
    */

    HeaderNavComponent.addToHeaderNav({
      active: false,
      description: 'Wähle zuerst ein Rezept',
      name: 'Rezept Info',
      action: (() => null),
      icon: 'info'
    });

    HeaderNavComponent.addToHeaderNav({
      active: false,
      description: 'Wähle zuerst ein Rezept',
      name: 'Rezept',
      action: (() => null),
      icon: 'delete'
    });


  }

  /**
   *
   * Öffnet den Dialog zur Vorbereitung einer Mahlzeit.
   *
   */
  public prepare() {

    this.camp.pipe(take(1)).pipe(mergeMap(camp =>
      this.specificMeal.pipe(take(1)).pipe(mergeMap(specificMeal =>

        this.dialog.open(MealPrepareComponent, {
          height: '618px',
          width: '1000px',
          data: {specificMeal, days: camp.days}
        }).afterClosed()
      )))).subscribe((specificMeal: SpecificMeal) => {

      if (specificMeal != null) {
        this.dbService.updateDocument(specificMeal);
      }

    });


  }

  /**
   * Öffnet den Dialog zu den Informationen der Mahlzeit.
   *
   */
  public mealInfoDialog() {

    this.camp.pipe(take(1)).pipe(mergeMap(camp =>
      this.meal.pipe(take(1)).pipe(mergeMap(meal =>
        this.specificMeal.pipe(take(1)).pipe(mergeMap(specificMeal =>

          // Dialog öffnen
          this.dialog.open(MealInfoComponent, {
            height: '618px',
            width: '1000px',
            data: {camp, meal, specificMeal}
          }).afterClosed()
        ))
      ))
    )).subscribe((resp: ([Meal, SpecificMeal] | null)) => {

      if (resp === null || resp === undefined) {

        return;

      }

      // Speichern der geänderten Daten im Dialog-Fenster
      this.dbService.updateDocument(resp[0]);
      this.dbService.updateDocument(resp[1]);

    });

  }

  /**
   * save on destroy (only if changed)
   *
   */
  public async save(): Promise<boolean> {

    let hasChanges = false;

    // save childs
    await this.editRecipes.forEach(async editRecipe => {
      editRecipe.save().then(changes => {
        hasChanges = hasChanges || changes;
      });
    });

    return hasChanges;

  }

  public async saveMeal() {

    // update meal
    const mealSubs = this.meal.subscribe(meal => {


      this.dbService.updateDocument(meal);

      // reset: deactivate save button
      mealSubs.unsubscribe();

    });


  }

  /**
   * Erstellt ein neues Rezept.
   *
   * Um Datenverluste zu vermeiden werden zuerst alle offenen Änderungen
   * der anderen Rezepte gespeichert.
   *
   */
  newRecipe() {

    this.save();

    this.urlPathData.pipe(this.loadIDFromURL('meals'))
      .subscribe(mealId =>

        this.dialog.open(AddRecipeComponent, {
          height: '618px',
          width: '1000px',
          data: null
        }).afterClosed().subscribe((results: SelectionModel<Recipe>) => {

          if (results) {

            this.camp.pipe(take(1))
              .subscribe(camp => this.urlPathData.pipe(this.loadIDFromURL('meals', 2))
                .subscribe(async specificMealId => {

                  await Promise.all(
                    results.selected.map(recipe => this.dbService.addRecipe(recipe, specificMealId, mealId, camp))
                  );

                  // request for update rights for meals, recipes and specificMeals and specificRecipes
                  this.dbService.refreshAccessData(camp.documentId, mealId)
                    .subscribe(console.log);

                }));
          }
        }));

  }

  private toggleChanges() {

    this.showOverwirtes = !this.showOverwirtes;

  }

  private saveButton() {

    HeaderNavComponent.turnOff('Speichern');
    this.save();

  }


}
