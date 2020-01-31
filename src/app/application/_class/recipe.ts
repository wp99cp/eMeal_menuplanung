import { Observable } from 'rxjs';
import { AccessData } from '../_interfaces/accessData';
import { FirestoreRecipe } from '../_interfaces/firestore-recipe';
import { Ingredient } from '../_interfaces/ingredient';
import { FirebaseObject } from './firebaseObject';
import { SpecificRecipe } from './specific-recipe';
import { Meal } from './meal';

export class Recipe extends FirebaseObject implements FirestoreRecipe {

  protected firestorePath: string;
  public firestoreElementId: string;

  public access: AccessData;
  public ingredients: Ingredient[];
  public name: string;
  public description: string;
  public notes: string;
  public meals: string[];

  public specificRecipe: Observable<SpecificRecipe>;

  /**
   *
   * Creates a new empty recipe with the given title and access rights.
   *
   * @param name Title of the recipe
   * @param access Access rights for the recipe
   */
  public static getEmptyRecipe(mealId: string, name?: string, access?: AccessData): FirestoreRecipe {

    // set undefined variables
    name = name === undefined ? '' : name;
    access = access === undefined ? {} : access;

    const recipe: FirestoreRecipe = {
      access,
      description: '',
      ingredients: [],
      name,
      notes: '',
      meals: [mealId]
    };

    return recipe;

  }

  /**
   * gibt den Firestore Path zurück
   */
  public static getCollectionPath(): string {

    return 'recipes/';

  }

  /**
  * gibt den Firestore Path zurück
  */
  public static getPath(recipeId: string): string {

    return Recipe.getCollectionPath() + recipeId;

  }

  constructor(recipeData: FirestoreRecipe, firestoreElementId: string, mealId: string, specificRecipe: Observable<SpecificRecipe>) {
    super();

    this.meals = recipeData.meals;

    this.firestorePath = 'recipes/';
    this.firestoreElementId = firestoreElementId;

    this.access = recipeData.access;
    this.ingredients = recipeData.ingredients;
    this.name = recipeData.name;
    this.description = recipeData.description;
    this.notes = recipeData.notes;

    this.specificRecipe = specificRecipe;

  }

  public extractDataToJSON(): FirestoreRecipe {

    return {
      meals: this.meals,
      access: this.access,
      ingredients: this.ingredients,
      name: this.name,
      description: this.description,
      notes: this.notes
    };

  }


}


