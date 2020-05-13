import {FirestoreRecipe, FirestoreSpecificRecipe, Ingredient} from '../_interfaces/firestoreDatatypes';
import {DatabaseService} from '../_service/database.service';
import {Camp} from './camp';
import {ExportableObject, FirestoreObject} from './firebaseObject';

/**
 *
 */
export class Recipe extends FirestoreObject implements ExportableObject {

  public readonly path: string;

  // TODO: add camp sepcific data handeling
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

    // check if every ingredient has a unique identifier
    // if missing it adds one
    this.ingredients.forEach(ing => {
      if (ing.unique_id === null || ing.unique_id === undefined) {
        ing.unique_id = Recipe.createIngredientId(this.documentId);
      }
    });

    this.name = recipe.recipe_name;
    this.description = recipe.recipe_description;
    this.notes = recipe.recipe_notes;

  }

  /**
   * Creates a new unique id for a ingredient.
   *
   */
  public static createIngredientId(docId) {

    return `${docId.substr(0, 6)}-${this.randomStr(6)}`;

  }

  private static randomStr(strLength) {
    const chars = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345678'];
    return [...Array(strLength)].map(() => chars[Math.trunc(Math.random() * chars.length)]).join('');
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


  public createSpecificRecipe(camp: Camp, recipeId: string, specificRecipeId: string, databaseService: DatabaseService):
    Promise<firebase.firestore.DocumentReference> {

    const specificRecipeData = FirestoreObject.exportEmptyDocument('') as FirestoreSpecificRecipe;

    specificRecipeData.recipe_participants = camp.participants;
    specificRecipeData.used_in_camp = camp.documentId;
    specificRecipeData.recipe_override_participants = false;
    specificRecipeData.recipe_used_for = 'all';
    specificRecipeData.access = this.getAccessData();
    specificRecipeData.recipe_specificId = specificRecipeId;

    const recipePath = 'recipes/' + recipeId + '/specificRecipes';
    return databaseService.addDocument(specificRecipeData, recipePath, specificRecipeId);

  }

}
