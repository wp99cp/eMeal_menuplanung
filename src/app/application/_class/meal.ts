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

  public usedInCamps: string[];

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
   *
   * Creates specific meal and recipe documents in the database for a related camp
   *
   * @param camp Releted Camp
   *
   */
  public createSpecificRecipes(databaseService: DatabaseService, camp: Camp, specificId: string) {

    databaseService.getRecipes(this.documentId)
      .subscribe(recipes => recipes.forEach(recipe =>
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
    specificMealData.meal_id = this.documentId;

    const mealPath = 'meals/' + this.documentId + '/specificMeals/';
    const ref = await databaseService.addDocument(specificMealData, mealPath);

    return ref.id;

  }

}
