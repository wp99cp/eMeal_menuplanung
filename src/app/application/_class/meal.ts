import { Observable, of } from 'rxjs';
import { AccessData } from '../_interfaces/accessData';
import { FirestoreMeal } from '../_interfaces/firestore-meal';
import { FirestoreSpecificMeal } from '../_interfaces/firestore-specific-meal-data';
import { FirestoreSpecificRecipe } from '../_interfaces/firestore-specific-recipe';
import { DatabaseService } from '../_service/database.service';
import { Camp } from './camp';
import { FirebaseObject } from './firebaseObject';
import { Recipe } from './recipe';
import { SpecificMeal } from './specific-meal';

export class Meal extends FirebaseObject implements FirestoreMeal {

    public readonly firestorePath = 'meals/';

    public title: string;
    public description: string;
    public access: AccessData;

    public recipes: Observable<Recipe[]>;


    constructor(data: FirestoreMeal, public readonly firestoreElementId: string, recipes?: Observable<Recipe[]>) {

        super();

        this.title = data.title;
        this.description = data.description;
        this.access = data.access;

        if (recipes != null) {
            this.recipes = recipes;
        } else {
            this.recipes = of();
        }

    }

    public extractDataToJSON(): FirestoreMeal {

        const firestoreMeal = {
            title: this.title,
            description: this.description,
            access: this.access,
            firestoreElementId: this.firestoreElementId
        };

        // Meals generated out of a day don't contain access and description properties
        // They are removed if they're undefinded...
        if (firestoreMeal.access === undefined) { delete firestoreMeal.access; }
        if (firestoreMeal.description === undefined) { delete firestoreMeal.description; }

        return firestoreMeal;

    }

    /**
     *
     * Creates specific meal and recipe documents in the database for a related camp
     *
     * @param camp Releted Camp
     *
     */
    public createSpecificData(databaseService: DatabaseService, camp: Camp) {

        const specificMealData: FirestoreSpecificMeal = {
            participants: camp.participants,
            campId: camp.firestoreElementId
        };
        const mealPath = 'meals/' + this.firestoreElementId + '/specificMeals';
        databaseService.addDocument(specificMealData, mealPath);

        this.recipes.subscribe(recipes => recipes.forEach(recipe => {

            const specificRecipeData: FirestoreSpecificRecipe = {
                participants: camp.participants,
                campId: camp.firestoreElementId
            };
            const recipePath = 'meals/' + this.firestoreElementId + '/recipes/' + recipe.firestoreElementId + '/specificRecipes';
            databaseService.addDocument(specificRecipeData, recipePath);

        }));

    }

}
