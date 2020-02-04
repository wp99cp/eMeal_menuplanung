import { firestore } from 'firebase';

import { FirestoreSpecificMeal, MealUsage } from '../_interfaces/firestoreDatatypes';
import { FirestoreObject, ExportableObject } from './firebaseObject';
import { Meal } from './meal';

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

    this.usedAs = meal.meal_used_as;


  }

  /**
   * Returns the id of the related meal
   */
  public getMealId() {

    const shortPath = this.path.substring(this.path.indexOf('/') + 1);
    return shortPath.substring(0, shortPath.indexOf('/'));

  }

  public toFirestoreDocument(): FirestoreSpecificMeal {

    const meal = super.toFirestoreDocument() as FirestoreSpecificMeal;
    meal.meal_participants = this.participants;
    meal.meal_prepare_date = firestore.Timestamp.fromDate(this.prepareAsDate);
    meal.meal_gets_prepared = this.prepare;
    meal.meal_weekview_name = this.weekTitle;
    meal.meal_override_participants = this.overrideParticipants;
    meal.meal_used_as = this.usedAs;

    return meal;

  }


}
