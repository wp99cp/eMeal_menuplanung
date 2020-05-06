import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Meal } from '../../_class/meal';
import { ErrorOnImport, RawMealData } from '../../_interfaces/rawMealData';
import { DatabaseService } from '../../_service/database.service';


/**
 * TODO: neue Import Möglichkeiten mit Import von Swissmilk oder aus einer Excel-Vorlage..
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
  public meal: Meal;

  public mealStr = '';


  constructor(private formBuilder: FormBuilder, private dbService: DatabaseService) {

    this.input = this.formBuilder.group({
      url: ''
    });

  }

  ngOnInit() { }


  loadFromURL() {


    this.dbService.importRecipe(this.input.value.url).then(rawMealData => this.createMeal(rawMealData));

  }

  createMeal(rawMealData: RawMealData | ErrorOnImport) {

    /*
    if ((rawMealData as ErrorOnImport).error) {
      console.log('Falsche URL');
      return;
    }

    const newRawMealData = rawMealData as RawMealData;

    const mealData: FirestoreMeal = {

      meal_name: newRawMealData.title,
      meal_description: newRawMealData.notes

    };
    this.meal = new Meal(mealData, '', '');

    const recipes: Recipe[] = [];

    newRawMealData.recipes.forEach(rawRecipeData => {

      rawRecipeData.ingredients = rawRecipeData.ingredients.map(ingredient => {

        const ingredientNew: Ingredient = {
          food: ingredient.food,
          unit: ingredient.unit,
          measure: ((ingredient.measure as number) / (newRawMealData.baseMeasure as number)),
          comment: ''
        };

        return ingredientNew;
      });

      const recipeData: FirestoreRecipe = {

        name: rawRecipeData.title,
        description: '',
        ingredients: rawRecipeData.ingredients,
        notes: '',
        access: null,
        meals: []

      };
      const recipe = new Recipe(recipeData, '', null);
      recipes.push(recipe);

    });

    this.meal.recipes = of(recipes);

    this.mealStr = JSON.stringify(this.meal.toFirestoreDocument());
    recipes.forEach(recipe => this.mealStr += JSON.stringify(recipe.toFirestoreDocument()));

    this.readyForImport = true;

    */
    console.error('TODO');
  }

}
