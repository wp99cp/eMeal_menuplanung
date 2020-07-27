import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {DatabaseService} from '../../_service/database.service';
import {FirestoreMeal, FirestoreRecipe} from '../../_interfaces/firestoreDatatypes';
import {AuthenticationService} from '../../_service/authentication.service';
import {FirestoreObject} from '../../_class/firebaseObject';


/**
 *
 * Import auch in der Rezept-Übersicht anbieten.
 *
 * Import Möglichkeiten auch für Lager und Mahlzeiten erweitern, ermöglichen, dass Lager als
 * Excel exportert werden können? (eher langfristig...). Aber sicher als JSON heruntergeladen und
 * wieder hochgeladen werden können.
 *
 */
@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.sass']
})
export class ImportComponent implements OnInit {

  public input: FormGroup;
  public readyForImport = false;

  public mealStr = '';

  public showSpinner = false;

  public showMessage = false;
  public message = '';

  public showMeal: boolean;
  public meal: FirestoreMeal;
  public recipes: FirestoreRecipe[] = [];


  constructor(private formBuilder: FormBuilder, private dbService: DatabaseService, private authService: AuthenticationService) {

    this.input = this.formBuilder.group({
      url: ''
    });

  }

  ngOnInit() {
  }


  loadMealFromURL() {

    // update layout
    this.showSpinner = true;
    this.showMessage = false;

    // load data
    this.dbService.importMeal(this.input.value.url)
      .subscribe(rawMealData => {

        // stop spinning
        this.showSpinner = false;
        console.log(rawMealData);

        // containing an error
        if (rawMealData.error) {

          switch (rawMealData.error) {

            case 'Invalid url!':
              this.showMessage = true;
              this.message = 'Ungültige URL! Diene URL ist ungültig oder diese Webseite wird (noch) nicht unterstützt.';
              break;

            default:
              this.showMessage = true;
              this.message = 'Ein unbekannter Fehler ist aufgetreten! Bitte versuche es erneut.';
              break;

          }

          return;

        }

        // No error: create Meal
        const uid = this.authService.fireAuth.auth.currentUser.uid;
        this.meal = FirestoreObject.exportEmptyDocument(uid) as FirestoreMeal;
        this.meal.meal_name = rawMealData.mealTitle;
        this.meal.meal_description = '';
        this.meal.meal_keywords = [];
        this.meal.used_in_camps = [];

        // create recipes
        rawMealData.recipes.forEach(rawRecipe => {

          const recipe = FirestoreObject.exportEmptyDocument(uid) as FirestoreRecipe;
          recipe.recipe_name = rawRecipe.recipeName;
          recipe.ingredients = rawRecipe.ingredients;
          recipe.recipe_notes = '';
          recipe.recipe_description = '';
          this.recipes.push(recipe);

        });

        this.showMeal = true;
        this.readyForImport = true;

      });

  }

  /**
   * Do importing
   */
  importMeal() {

    if (!this.readyForImport) {
      return;
    }

    // save
    this.dbService.addDocument(this.meal, 'meals')
      .then(res => {
        this.recipes.forEach(recipe => {
          recipe.used_in_meals = [res.id];
          this.dbService.addDocument(recipe, 'recipes');
        });
      });


  }

}
