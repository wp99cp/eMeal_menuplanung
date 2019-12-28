import { Camp } from './camp';
import { Meal } from './meal';
import { firestore } from 'firebase';
import { DayData } from '../_interfaces/day-data';
import { FirestoreMeal } from '../_interfaces/firestore-meal';
import { SettingsService } from '../_service/settings.service';

/**
 *
 */
export class Day implements DayData {

  public date: firestore.Timestamp;
  public dateAsTypeDate: Date;
  public description: string;
  public meals: Meal[];


  /**
   *
   * Creates an empty meal. The given user has owner access to the meal.
   *
   * @param user User with owner access. If missing, no user has access.
   */
  public static getEmptyMeal(uids?: string[]): FirestoreMeal {

    if (uids === undefined) {
      uids = [];
    }

    const meal: FirestoreMeal = {
      access: { owner: uids, editor: [] },
      description: '',
      title: 'Neue Mahlzeit'
    };

    return meal;

  }

  constructor(data: DayData, camp: Camp) {

    const date: firestore.Timestamp = data.date;
    this.dateAsTypeDate = date.toDate();

    // optionale Felder
    this.description = data.description !== undefined ? data.description : '';

    this.meals = data.meals.map(mealData => new Meal(mealData as FirestoreMeal, mealData.firestoreElementId));
  }

  extractDataToJSON(): DayData {

    const dayData: DayData = {
      date: firestore.Timestamp.fromDate(this.dateAsTypeDate),
      meals: this.meals.map((meal: Meal) => meal.extractDataToJSON())
    };

    // optionale Felder
    if (this.description !== '') {
      dayData.description = this.description;
    }

    return dayData;
  }


  public getDateStr(): string {
    return SettingsService.toString(this.dateAsTypeDate);
  }

  public getDiscriptionInBracket(): String {

    if (this.description !== '') {
      return '(' + this.description + ')';
    }

    return '';
  }


}
