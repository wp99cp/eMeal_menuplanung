import { firestore } from 'firebase/app';
import { Observable } from 'rxjs';

import { DayData } from '../_interfaces/firestoreDatatypes';
import { DatabaseService } from '../_service/database.service';
import { SpecificMeal } from './specific-meal';

/**
 * Day repräsentiert ein Tag im Lager.
 *
 */
export class Day {

  private static loadedMealsOfDays = {};

  private readonly campId: string;

  public dateAsTypeDate: Date;
  public description: string;
  public notes: string;

  // specific meals of this day
  private meals: Observable<SpecificMeal[]> = undefined;

  constructor(data: DayData, campId: string) {

    this.dateAsTypeDate = data.day_date.toDate();
    this.description = data.day_description;
    this.notes = data.day_notes ? data.day_notes : '';

    this.campId = campId;

  }


  /**
   * Gibt die Mahlzeiten des Tages zurück.
   *
   * @returns Die Mahlzeiten des Tages
   *
   */
  public getMeals(): Observable<SpecificMeal[]> | undefined {

    return this.meals;

  }



  /**
   * Ein Tag wird im Normalfall ohne die Mahlzeiten geladen.
   *
   * Die Mahlzeiten des Tages können mit dieser Funktion nach-
   * geladen werden.
   *

   */
  loadMeals(dbService: DatabaseService) {

    if (Day.loadedMealsOfDays[this.campId + this.getTimestamp()]) {
      this.meals = Day.loadedMealsOfDays[this.campId + this.getTimestamp()];

    } else {
      this.meals = dbService.getSpecificMeals(this.campId, this.getTimestamp());
      Day.loadedMealsOfDays[this.campId + this.getTimestamp()] = this.meals;
    }

  }

  /**
   * Gibt das Datum als Timestamp zurück.
   *
   */
  public getTimestamp(): firestore.Timestamp {

    return firestore.Timestamp.fromDate(this.dateAsTypeDate);

  }

  /**
   * Exportiert den Tag.
   *
   * Dieser Export wird für das Speichern des
   * Lagers benötigt.
   *
   */
  public exportDay(): DayData {

    const day = {
      day_date: this.getTimestamp(),
      day_description: this.description,
      day_notes: this.notes
    };

    return day;

  }


  /**
   * Gibt die Beschriftung in Klammern zurück.
   *
   * Falls keine Beschriftung vorhanden, wird
   * ein leerer String zurückgegeben.
   *
   */
  public getDiscriptionInBracket(): string {

    if (this.description !== '') {
      return '(' + this.description + ')';
    }

    return '';
  }

}
