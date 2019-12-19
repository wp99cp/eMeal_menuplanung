import { AngularFirestore } from '@angular/fire/firestore';
import { FirebaseObject } from './firebaseObject';
import { FirestoreSpecificRecipe } from '../_interfaces/firestore-specific-recipe';
import { Recipe } from './recipe';

export class SpecificRecipe extends FirebaseObject implements FirestoreSpecificRecipe {


  public campId: string;

  public participants: number;
  public overrideParticipants = false;
  protected firestorePath: string;
  protected firestoreElementId: string;
  public specificMealId: string;


  public static getCollectionPath(mealId: string, recipeId: string) {
    return Recipe.getPath(mealId, recipeId) + '/specificRecipes/';
  }

  public static getPath(mealId: string, recipeId: string, specificMealId: string) {
    return SpecificRecipe.getCollectionPath(mealId, recipeId) + specificMealId;
  }

  public static createEmptySpecificRecipe(campId: string, specificMealId: string) {

    const specificRecipe: FirestoreSpecificRecipe = {
      participants: 1,
      campId,
      overrideParticipants: false,
      specificMealId
    };

    return specificRecipe;
  }

  constructor(data: FirestoreSpecificRecipe, path: string) {

    super();

    this.firestorePath = path.substring(0, path.lastIndexOf('/'));
    this.firestoreElementId = path.substring(path.lastIndexOf('/'));

    this.specificMealId = data.specificMealId;

    this.participants = data.participants;
    this.campId = data.campId;

    if (data.overrideParticipants !== undefined) {
      this.overrideParticipants = data.overrideParticipants;
    }

  }

  public extractDataToJSON(): FirestoreSpecificRecipe {

    return {
      participants: this.participants,
      campId: this.campId,
      overrideParticipants: this.overrideParticipants,
      specificMealId: this.specificMealId
    };

  }


}
