import { DayData, FirestoreCamp, FirestoreMeal, MealUsage, UserGroups, FirestoreRecipe } from './firestoreDatatypes';
import { ShoppingList } from '../exportCamp/shopping-list'
import { firestore } from 'firebase-admin';

export interface ExportedRecipe extends FirestoreRecipe {
    recipe_participants: number;
    recipe_used_for: UserGroups;
}

export interface ExportedMeal extends FirestoreMeal {
    meal_participants: number;
    meal_weekview_name: string;
    meal_used_as: MealUsage;
    meal_gets_prepared: boolean;
    meal_prepare_date: Date;
    meal_date: firestore.Timestamp;
    meal_data_as_date: Date;
    recipes: ExportedRecipe[];
}

export interface ExportedDay extends DayData {
    meals: ExportedMeal[];
    meals_to_prepare: ExportedMeal[];
    day_date_as_date: Date;
    shoppingList: ShoppingList;

}

export interface ExportedCamp extends FirestoreCamp {

    documentId: string;
    shoppingList: ShoppingList;
    days: ExportedDay[];

    meals_to_prepare: ExportedMeal[];

}
