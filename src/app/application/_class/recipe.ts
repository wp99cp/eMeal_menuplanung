import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, Observer } from 'rxjs';
import { AccessData } from '../_interfaces/accessData';
import { FirestoreRecipe } from '../_interfaces/firestore-recipe';
import { FirestoreSpecificRecipe } from '../_interfaces/firestore-specific-recipe';
import { Ingredient } from '../_interfaces/ingredient';
import { FirebaseObject } from './firebaseObject';
import { SpecificRecipe } from './specific-recipe';
import { Meal } from './meal';

export class Recipe extends FirebaseObject implements FirestoreRecipe {

  protected firestorePath: string;
  public firestoreElementId: any;

  public access: AccessData;
  public ingredients: Ingredient[];
  public name: string;
  public description: string;
  public notes: string;

  public specificRecipe: Observable<SpecificRecipe>;

  /**
   *
   * Creates a new empty recipe with the given title and access rights.
   *
   * @param name Title of the recipe
   * @param access Access rights for the recipe
   */
  public static getEmptyRecipe(name?: string, access?: AccessData): FirestoreRecipe {

    // set undefined variables
    name = name === undefined ? '' : name;
    access = access === undefined ? { editor: [], owner: [] } : access;

    const recipe: FirestoreRecipe = {
      access,
      description: '',
      ingredients: [],
      name,
      notes: ''
    };

    return recipe;

  }

  /**
   * gibt den Firestore Path zurück
   */
  public static getCollectionPath(mealId: string): string {

    return Meal.getCollectionPath() + mealId + '/recipes/';

  }

  /**
  * gibt den Firestore Path zurück
  */
  public static getPath(mealId: string, recipeId: string): string {

    return Recipe.getCollectionPath(mealId) + recipeId;

  }

  constructor(recipeData: FirestoreRecipe, firestoreElementId: string, mealId: string, specificRecipe: Observable<SpecificRecipe>) {
    super();

    this.firestorePath = 'meals/' + mealId + '/recipes/';
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
      access: this.access,
      ingredients: this.ingredients,
      name: this.name,
      description: this.description,
      notes: this.notes
    };

  }


}


