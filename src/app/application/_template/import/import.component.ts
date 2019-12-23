import { Component, OnInit } from '@angular/core';
import { Meal } from '../../_class/meal';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DatabaseService } from '../../_service/database.service';
import { FirestoreMeal } from '../../_interfaces/firestore-meal';
import { RawMealData, ErrorOnImport } from '../../_interfaces/rawMealData';
import { Recipe } from '../../_class/recipe';
import { FirestoreRecipe } from '../../_interfaces/firestore-recipe';
import { of } from 'rxjs';
import { Ingredient } from '../../_interfaces/ingredient';

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

  ngOnInit() {
  }


  loadFromURL() {


    this.dbService.importRecipe(this.input.value.url).then(rawMealData => this.createMeal(rawMealData));

  }

  createMeal(rawMealData: RawMealData | ErrorOnImport) {

    if ((rawMealData as ErrorOnImport).error) {
      console.log('Falsche URL');
      return;
    }

    const newRawMealData = rawMealData as RawMealData;

    const mealData: FirestoreMeal = {

      title: newRawMealData.title,
      description: newRawMealData.notes

    };
    this.meal = new Meal(mealData, '');

    const recipes: Recipe[] = [];

    console.log(newRawMealData.baseMeasure);

    newRawMealData.recipes.forEach(rawRecipeData => {

      rawRecipeData.ingredients = rawRecipeData.ingredients.map(ingredient => {

        const ingredientNew: Ingredient = {
          food: ingredient.food,
          unit: ingredient.unit,
          measure: ((ingredient.measure as number) / (newRawMealData.baseMeasure as number))
        };

        return ingredientNew;
      });

      const recipeData: FirestoreRecipe = {

        name: rawRecipeData.title,
        description: '',
        ingredients: rawRecipeData.ingredients,
        notes: '',
        access: null

      };
      const recipe = new Recipe(recipeData, '', '', null);
      recipes.push(recipe);

    });

    this.meal.recipes = of(recipes);

    console.log('finished');
    this.mealStr = JSON.stringify(this.meal.extractDataToJSON());
    recipes.forEach(recipe => this.mealStr += JSON.stringify(recipe.extractDataToJSON()))


    this.readyForImport = true;

  }

}
