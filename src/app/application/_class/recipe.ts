import {FirestoreRecipe, FirestoreSpecificRecipe, Ingredient} from '../_interfaces/firestoreDatatypes';
import {DatabaseService} from '../_service/database.service';
import {Camp} from './camp';
import {ExportableObject, FirestoreObject} from './firebaseObject';
import {OverwritableIngredient} from './overwritableIngredient';
import * as firebase from 'firebase';

/**
 *
 */
export class Recipe extends FirestoreObject implements ExportableObject {

  public readonly path: string;

  public readonly documentId: string;
  public name: string;
  public description: string;
  public notes: string;
  public usedInMeals: string[];

  private ingredients: { [id: string]: OverwritableIngredient };
  private currentWriter: string;

  constructor(recipe: FirestoreRecipe, path: string) {

    super(recipe);

    this.usedInMeals = recipe.used_in_meals;

    this.documentId = path.substring(path.lastIndexOf('/') + 1);
    this.path = path;

    this.currentWriter = this.documentId;
    this.ingredients = {};

    // check if every ingredient has a unique identifier
    // if missing it adds one
    recipe.ingredients.forEach(ing => {

      if (ing.unique_id === null || ing.unique_id === undefined) {
        ing.unique_id = Recipe.createIngredientId(this.documentId);
      }

      this.ingredients[ing.unique_id] = new OverwritableIngredient(ing, this.currentWriter);

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

  /**
   * Adds a set of ingredients to this recipe.
   * The ingredients gets merged such that the ingredients with the same
   * unique_id gets overwritten.
   *
   * @param ingredients ingredients to add to this recipe
   * @param name of the source of this overwriting
   *
   */
  public overwriteIngredients(ingredients: Ingredient[], documentId: string) {

    this.currentWriter = documentId;

    ingredients.forEach(ing => {
      if (this.ingredients[ing.unique_id] == null) {
        this.ingredients[ing.unique_id] = new OverwritableIngredient(ing, this.currentWriter);
      } else {
        this.ingredients[ing.unique_id].addOverwite(ing, this.currentWriter);
      }
    });

  }

  /**
   * Removes all overwriting ingredients form a specificDocument. If no documentId gets passed,
   * this function removes all overwriting ingredients form the current recipe.
   *
   * @param documentId Id of the document whose overwriting ingredients should be removed
   *
   */
  public removeOverwritingIngredients(documentId: string = this.documentId) {

    for (const ing in this.ingredients) {
      if (this.ingredients.hasOwnProperty(ing)) {
        this.ingredients[ing].removeOverwiting(documentId);
      }
    }

  }

  /**
   *
   * Adds a new ingredient to the recipe. Depending on the current overwriter
   * the source id is set that of the recipe or overwirter.
   *
   * @param ingredient data of the ingredient
   */
  public addIngredient(ingredient: Ingredient) {

    this.ingredients[ingredient.unique_id] = new OverwritableIngredient(ingredient, this.currentWriter);

  }

  /**
   * TODO: Gets all overwriting ingredients form a specificDocument. If no documentId gets passed,
   * this function gets all overwriting ingredients form the current recipe.
   *
   * @param documentId Id of the document whose overwriting ingredients should be returned
   *
   */
  public getOverwritingIngredients(documentId?: string) {

    return [];

  }

  /**
   * Returns the ingredients of the recipe without the overwriting
   *
   */
  public getOriginalIngredients() {

    return Object.values(this.ingredients).map(ing => ing.getDefault());

  }

  /**
   * Returns the ingredients of the recipe with all overwriting
   *
   */
  public getIngredients() {

    return Object.values(this.ingredients).map(ing => ing.getOverwriten());

  }

  public toFirestoreDocument(): FirestoreRecipe {

    const recipe = super.toFirestoreDocument() as FirestoreRecipe;
    recipe.recipe_description = this.description;
    recipe.recipe_name = this.name;
    recipe.used_in_meals = this.usedInMeals;
    recipe.ingredients = this.getOriginalIngredients();
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
