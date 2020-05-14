import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, mergeMap, take } from 'rxjs/operators';
import { HeaderNavComponent } from 'src/app/_template/header-nav/header-nav.component';

import { Camp } from '../../_class/camp';
import { Meal } from '../../_class/meal';
import { Recipe } from '../../_class/recipe';
import { SpecificMeal } from '../../_class/specific-meal';
import { SpecificRecipe } from '../../_class/specific-recipe';
import { AddRecipeComponent } from '../../_dialoges/add-recipe/add-recipe.component';
import { MealInfoComponent } from '../../_dialoges/meal-info/meal-info.component';
import { MealPrepareComponent } from '../../_dialoges/meal-prepare/meal-prepare.component';
import { Saveable } from '../../_service/auto-save.service';
import { DatabaseService } from '../../_service/database.service';
import { SettingsService } from '../../_service/settings.service';
import { EditRecipeInCampComponent } from '../../_template/edit-recipe-in-camp/edit-recipe-in-camp.component';
import { SwissDateAdapter } from 'src/app/utils/format-datapicker';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-meal',
  templateUrl: './edit-meal.component.html',
  styleUrls: ['./edit-meal.component.sass']
})
export class EditMealComponent implements OnInit, Saveable {

  private campId: Observable<string>;
  private mealId: Observable<string>;
  private specificMealId: Observable<string>;

  public camp: Observable<Camp>;

  public meal: Observable<Meal>;
  public specificMeal: Observable<SpecificMeal>;
  public recipes: Observable<Recipe[]>;
  public specificRecipes: Observable<SpecificRecipe[]>;


  public indexOfOpenedPanel = -1;

  public calcMealPart = SettingsService.calcMealParticipants;

  @ViewChildren(EditRecipeInCampComponent) editRecipes: QueryList<EditRecipeInCampComponent>;

  constructor(
    private route: ActivatedRoute,
    public dbService: DatabaseService,
    public dialog: MatDialog,
    private router: Router,
    public swissDateAdapter: SwissDateAdapter) { }

  public newOpened(index: number) {

    this.indexOfOpenedPanel = index;

  }

  ngOnInit() {

    // Ladet die Ids von der URL
    this.campId = this.route.url.pipe(take(1)).pipe(map(url => url[url.length - 4].path));
    this.mealId = this.route.url.pipe(take(1)).pipe(map(url => url[url.length - 2].path));
    this.specificMealId = this.route.url.pipe(take(1)).pipe(map(url => url[url.length - 1].path));

    // Ladet die benötigten Dokumente
    this.camp = this.campId.pipe(mergeMap(id => this.dbService.getCampById(id)));
    this.meal = this.mealId.pipe(mergeMap(mealId => this.dbService.getMealById(mealId)));
    this.specificMeal = this.mealId.pipe(mergeMap(mealId => this.specificMealId.pipe(mergeMap(specificMealId =>
      this.dbService.getSpecificMeal(mealId, specificMealId)
    ))));
    this.recipes = this.mealId.pipe(mergeMap(mealId => this.dbService.getRecipes(mealId)));

    this.camp.pipe(take(1)).subscribe(camp =>

      HeaderNavComponent.addToHeaderNav({
        active: true,
        description: 'Zurück zum ' + camp.name,
        name: camp.name,
        action: (() => this.router.navigate(['../../..'], { relativeTo: this.route })),
        icon: 'nature_people',
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


  private saveButton() {

    HeaderNavComponent.turnOff('Speichern');
    this.save();

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
          data: { specificMeal, days: camp.days }
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
            data: { camp, meal, specificMeal }
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
      editRecipe.save().then(changes => { hasChanges = hasChanges || changes; });
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


    this.mealId.subscribe(mealId =>

      this.dialog.open(AddRecipeComponent, {
        height: '618px',
        width: '1000px',
        data: null
      }).afterClosed().subscribe((results: SelectionModel<Recipe>) => {

        if (results) {

          this.camp.pipe(take(1)).subscribe(camp => this.specificMealId.pipe(take(1)).subscribe(specificMealId =>
            results.selected.forEach(recipe => this.dbService.addRecipe(recipe, specificMealId, mealId, camp))
          ));

        }

      })

    );

  }

}
