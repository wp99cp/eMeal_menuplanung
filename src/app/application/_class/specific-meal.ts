import { FirestoreSpecificMeal } from '../_interfaces/firestore-specific-meal-data';
import { FirebaseObject } from './firebaseObject';
import { Meal } from './meal';

export class SpecificMeal extends FirebaseObject implements FirestoreSpecificMeal {


  public campId: string;
  public participants: number;
  public overrideParticipants = false;
  public weekTitle = '';

  protected firestorePath: string;
  public firestoreElementId: string;

  /**
  * gibt den Firestore Path zurück
  */
  public static getCollectionPath(mealId: string): string {
    return Meal.getPath(mealId) + '/specificMeals/';
  }

  public static getPath(mealId: string, specificMealId: string): string {
    return SpecificMeal.getCollectionPath(mealId) + specificMealId;
  }

  constructor(data: FirestoreSpecificMeal, path: string) {

    super();

    this.firestorePath = path.substring(0, path.lastIndexOf('/'));
    this.firestoreElementId = path.substring(path.lastIndexOf('/'));

    this.participants = data.participants;
    this.campId = data.campId;

    if (data.weekTitle !== undefined) {
      this.weekTitle = data.weekTitle;
    }

    if (data.overrideParticipants !== undefined) {
      this.overrideParticipants = data.overrideParticipants;
    }

  }

  public extractDataToJSON(): FirestoreSpecificMeal {

    return {
      participants: this.participants,
      campId: this.campId,
      weekTitle: this.weekTitle,
      overrideParticipants: this.overrideParticipants
    };

  }


}
