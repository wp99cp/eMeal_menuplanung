import { Observable } from 'rxjs';

import { FirestoreMeal, FirestoreSpecificMeal, FirestoreSpecificRecipe, MealUsage } from '../_interfaces/firestoreDatatypes';
import { DatabaseService } from '../_service/database.service';
import { Camp } from './camp';
import { Day } from './day';
import { ExportableObject, FirestoreObject } from './firebaseObject';
import { Recipe } from './recipe';

/**
 *
 */
export class Meal extends FirestoreObject implements ExportableObject {

  public readonly path;
  public readonly documentId;

  // Felder
  public name: string;
  public description: string;
  public keywords: string[];
  public lastMeal: MealUsage;
  public usedAs: MealUsage;
  public participantsWarning: boolean;

  // Rezepte
  private recipes: Observable<Recipe[]> = undefined;

  constructor(meal: FirestoreMeal, path: string) {

    super(meal);

    this.documentId = path.substring(path.lastIndexOf('/') + 1);
    this.path = path;

    this.name = meal.meal_name;
    this.description = meal.meal_description;
    this.keywords = meal.meal_keywords;
    this.lastMeal = meal.meal_last_usage;


  }

  public toFirestoreDocument(): FirestoreMeal {

    const firestoreMeal = super.toFirestoreDocument() as FirestoreMeal;

    firestoreMeal.meal_name = this.name;
    firestoreMeal.meal_description = this.description;
    firestoreMeal.meal_keywords = this.keywords;
    firestoreMeal.meal_last_usage = this.lastMeal;

    return firestoreMeal;

  }

  /**
   * Ladet die Rezepte der Mahlzeit nach.
   * Im Normalfall werden die Rezepte nicht mit-
   * geladen. Mit dieser Funktion werden die
   * Rezepte nachgeladen.
   *
   */
  public loadRecipes(dbService: DatabaseService) {

    this.recipes = dbService.getRecipes(this.documentId);

  }

  /**
   * Gibt die Rezepte des Tages zurück.
   *
   * @returns Die Rezepte des Tages
   *
   */
  public getRecipes() {

    if (this.recipes === undefined) {
      throw new Error('Recipes not loaded yet.');
    }

    return this.recipes;

  }

  /**
   *
   * Creates specific meal and recipe documents in the database for a related camp
   *
   * @param camp Releted Camp
   *
   */
  public createSpecificRecipes(databaseService: DatabaseService, camp: Camp, specificId: string) {

    if (this.recipes === undefined || this.recipes === null) {
      this.recipes = databaseService.getRecipes(this.documentId);
    }

    this.recipes.subscribe(recipes => recipes.forEach(recipe =>
      recipe.createSpecificRecipe(camp, recipe.documentId, specificId, databaseService)
    ));

  }

  /**
   * Creates a specificMeal from the current meal
   *
   */
  public async createSpecificMeal(databaseService: DatabaseService, camp: Camp, day: Day, usedAs: MealUsage): Promise<string> {

    const specificMealData = FirestoreObject.exportEmptyDocument('') as FirestoreSpecificMeal;
    specificMealData.meal_participants = camp.participants;
    specificMealData.used_in_camp = camp.documentId;
    specificMealData.meal_weekview_name = this.name;
    specificMealData.meal_override_participants = false;
    specificMealData.access = this.getAccessData();
    specificMealData.meal_date = day.getTimestamp();
    specificMealData.meal_gets_prepared = false;
    specificMealData.meal_prepare_date = day.getTimestamp();
    specificMealData.meal_used_as = usedAs;

    const mealPath = 'meals/' + this.documentId + '/specificMeals/';
    const ref = await databaseService.addDocument(specificMealData, mealPath);

    return ref.id;

  }

}
