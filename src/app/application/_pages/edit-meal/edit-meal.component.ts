import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, mergeMap, take } from 'rxjs/operators';
import { HeaderNavComponent } from 'src/app/_template/header-nav/header-nav.component';
import { TemplateHeaderComponent as Header } from 'src/app/_template/template-header/template-header.component';
import { SelectionModel } from '@angular/cdk/collections';

import { Camp } from '../../_class/camp';
import { Meal } from '../../_class/meal';
import { SpecificMeal } from '../../_class/specific-meal';
import { MealInfoComponent } from '../../_dialoges/meal-info/meal-info.component';
import { Saveable } from '../../_service/auto-save.service';
import { DatabaseService } from '../../_service/database.service';
import { EditRecipeComponent } from '../../_template/edit-recipe/edit-recipe.component';
import { AddRecipeComponent } from '../../_dialoges/add-recipe/add-recipe.component';
import { FirestoreRecipe } from '../../_interfaces/firestore-recipe';
import { Recipe } from '../../_class/recipe';
import { SettingsService } from '../../_service/settings.service';

@Component({
  selector: 'app-edit-meal',
  templateUrl: './edit-meal.component.html',
  styleUrls: ['./edit-meal.component.sass']
})
export class EditMealComponent implements OnInit, Saveable {

  public indexOfOpenedPanel = -1;
  public specificMeal: Observable<SpecificMeal>;
  public meal: Observable<Meal>;
  public camp: Observable<Camp>;
  private campId: Observable<string>;
  private mealId: Observable<string>;
  private specificMealId: Observable<string>;

  public calcMealPart = SettingsService.calcMealParticipants;

  @ViewChildren(EditRecipeComponent) editRecipes: QueryList<EditRecipeComponent>;


  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private databaseService: DatabaseService,
    public dialog: MatDialog,
    private router: Router) { }

  public newOpened(index: number) {

    this.indexOfOpenedPanel = index;

  }

  ngOnInit() {


    // Objecte definieren
    this.campId = this.route.url.pipe(map(url => url[url.length - 4].path));
    this.mealId = this.route.url.pipe(map(url => url[url.length - 2].path));
    this.specificMealId = this.route.url.pipe(map(url => url[url.length - 1].path));
    this.camp = this.campId.pipe(mergeMap(id => this.databaseService.getCampById(id)));
    this.meal = this.campId.pipe(mergeMap(campId =>
      this.mealId.pipe(mergeMap(mealId =>
        this.specificMealId.pipe(mergeMap(specificMealId =>
          this.databaseService.getMealById(mealId, specificMealId, campId)
        ))
      ))
    ));

    this.specificMeal = this.campId.pipe(mergeMap(campId =>
      this.mealId.pipe(mergeMap(mealId => this.specificMealId.pipe(mergeMap(specificMealId =>
        this.databaseService.getSpecificMeal(mealId, specificMealId, campId)
      ))))));



    // set header Info
    this.meal.subscribe(meal => this.camp.subscribe(camp => this.setHeaderInfo(camp, meal)));



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
      active: false,
      description: 'Kommt bald',
      name: 'Export',
      action: (() => null),
      icon: 'cloud_download',
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
   */
  public mealInfoDialog() {

    this.camp.pipe(take(1)).pipe(mergeMap(camp =>
      this.meal.pipe(take(1)).pipe(mergeMap(meal =>
        this.specificMeal.pipe(take(1)).pipe(mergeMap(specificMeal => {

          // Speichern der noch offenen Änderungen
          this.databaseService.updateDocument(meal.extractDataToJSON(), meal.getDocPath());
          this.databaseService.updateDocument(specificMeal.extractDataToJSON(), specificMeal.getDocPath());

          // Dialog öffnen
          return this.dialog.open(MealInfoComponent, {
            height: '618px',
            width: '1000px',
            data: { camp, meal, specificMeal }
          }).afterClosed();

        }))
      ))
    )).subscribe(([mealResponse, specificMealResponse]: [Meal, SpecificMeal]) => {

      // Speichern der geänderten Daten im Dialog-Fenster
      this.databaseService.updateDocument(mealResponse.extractDataToJSON(), mealResponse.getDocPath());
      this.databaseService.updateDocument(specificMealResponse.extractDataToJSON(), specificMealResponse.getDocPath());

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


      this.databaseService.updateDocument(meal.extractDataToJSON(), meal.getDocPath());

      // reset: deactivate save button
      mealSubs.unsubscribe();

    });



  }

  /** setzt die HeaderInfos für die aktuelle Seite */
  private setHeaderInfo(camp, meal): void {

    Header.title = meal.name;
    Header.path = ['Startseite', 'meine Lager', camp.name, '', '', meal.name];

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
          results.selected.forEach(recipe => this.databaseService.addRecipe(recipe.firestoreElementId, mealId));
        }

      })

    );

  }

}
