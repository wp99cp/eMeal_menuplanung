
import {FirestoreSpecificMeal, MealUsage} from '../_interfaces/firestoreDatatypes';
import {ExportableObject, FirestoreObject} from './firebaseObject';
import firebase from "firebase/compat/app";
import Timestamp = firebase.firestore.Timestamp;


export class SpecificMeal extends FirestoreObject implements ExportableObject {

  public readonly documentId: string;
  public readonly path: string;

  public campId: string;
  public participants: number;
  public overrideParticipants = false;
  public weekTitle = '';
  public usedAs: MealUsage;

  public prepareAsDate: Date;
  public prepare: boolean;
  public date: Timestamp;
  private mealId;

  constructor(meal: FirestoreSpecificMeal, path: string) {

    super(meal);

    this.path = path;
    this.documentId = path.substring(path.lastIndexOf('/') + 1);

    this.participants = meal.meal_participants;
    this.campId = meal.used_in_camp;
    this.weekTitle = meal.meal_weekview_name;
    this.overrideParticipants = meal.meal_override_participants;
    this.prepareAsDate = meal.meal_prepare_date.toDate();
    this.prepare = meal.meal_gets_prepared;
    this.date = meal.meal_date;
    this.usedAs = meal.meal_used_as;
    this.mealId = meal.meal_id !== undefined ? meal.meal_id : this.getMealIdByPath();

  }

  /**
   * Returns the id of the related meal
   */
  private getMealIdByPath() {

    const shortPath = this.path.substring(this.path.indexOf('/') + 1);
    return shortPath.substring(0, shortPath.indexOf('/'));

  }

  public getMealId() {

    return this.mealId;
  }


  public toFirestoreDocument(): FirestoreSpecificMeal {

    const meal = super.toFirestoreDocument() as FirestoreSpecificMeal;
    meal.meal_participants = this.participants;
    meal.meal_prepare_date = Timestamp.fromDate(this.prepareAsDate);
    meal.meal_gets_prepared = this.prepare;
    meal.meal_weekview_name = this.weekTitle;
    meal.meal_override_participants = this.overrideParticipants;
    meal.meal_used_as = this.usedAs;
    meal.meal_date = this.date;
    meal.meal_id = this.mealId;

    return meal;

  }


}
