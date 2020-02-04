import { FirestoreRecipe, Ingredient, FirestoreSpecificRecipe } from '../_interfaces/firestoreDatatypes';
import { ExportableObject, FirestoreObject } from './firebaseObject';
import { Camp } from './camp';
import { DatabaseService } from '../_service/database.service';

/**
 *
 */
export class Recipe extends FirestoreObject implements ExportableObject {

  public readonly path: string;
  public readonly documentId: string;

  // Fields
  public ingredients: Ingredient[];
  public name: string;
  public description: string;
  public notes: string;
  public usedInMeals: string[];

  constructor(recipe: FirestoreRecipe, path: string) {

    super(recipe);

    this.usedInMeals = recipe.used_in_meals;

    this.documentId = path.substring(path.lastIndexOf('/') + 1);
    this.path = path;

    this.ingredients = recipe.ingredients;
    this.name = recipe.recipe_name;
    this.description = recipe.recipe_description;
    this.notes = recipe.recipe_notes;

  }

  public toFirestoreDocument(): FirestoreRecipe {

    const recipe = super.toFirestoreDocument() as FirestoreRecipe;
    recipe.recipe_description = this.description;
    recipe.recipe_name = this.name;
    recipe.used_in_meals = this.usedInMeals;
    recipe.ingredients = this.ingredients;
    recipe.recipe_notes = this.notes;

    return recipe;

  }


  public createSpecificRecipe(camp: Camp, recipeId: string, specificRecipeId: string, databaseService: DatabaseService) {

    const specificRecipeData = FirestoreObject.exportEmptyDocument('') as FirestoreSpecificRecipe;


    specificRecipeData.recipe_participants = camp.participants;
    specificRecipeData.used_in_camp = camp.documentId;
    specificRecipeData.recipe_override_participants = false;
    specificRecipeData.recipe_used_for = 'all';
    specificRecipeData.access = this.getAccessData();

    const recipePath = 'recipes/' + recipeId + '/specificRecipes/' + specificRecipeId;
    databaseService.addDocument(specificRecipeData, recipePath);

  }

}
