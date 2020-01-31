import { VegiStates } from '../_interfaces/firestore-specific-recipe';


export class InvalidArgumentException extends Error { }

/**
 * Settings Service
 *
 * This service offers some functions that can be changed on the settings page of the application.
 * For example it provides a convertion function of a date to it's swiss-date string according to
 * the settings of the user (which format).
 *
 */
export class SettingsService {

  /**
   * Konvertier ein Datum in den passenden 'Swiss-String'
   */
  public static toString(date: Date): string {

    return date.toLocaleDateString('de-CH',
      { weekday: 'long', year: 'numeric', month: 'short', day: '2-digit' }
    );

  }

  /**
   * Konvertier ein Datum in den passenden 'Swiss-String'
   */
  public static toStringMinutes(date: Date): string {

    return date.toLocaleDateString('de-CH',
      { weekday: 'long', year: 'numeric', month: 'short', day: '2-digit', hour: 'numeric', minute: 'numeric', timeZone: 'Europe/Berlin' }
    );

  }

  /**
   * Calculates the participants of a meal
   *
   */
  public static calcMealParticipants(
    campPart: number,
    mealPart: number,
    mealOverride: boolean) {

    if (mealOverride) {
      return mealPart;
    }

    return campPart;

  }

  /**
   * Calculates the participants of a recipe
   *
   */
  public static calcRecipeParticipants(
    campPart: number,
    campVegis: number,
    mealPart: number,
    recipePart: number,
    mealOver: boolean,
    recipeOver: boolean,
    vegiState: VegiStates) {

    if (vegiState === 'vegiOnly') {

      return campVegis;
    }

    const calcMealPart = SettingsService.calcMealParticipants(campPart, mealPart, mealOver);
    const calcRecipePart = recipeOver ? recipePart : calcMealPart;

    if (vegiState === 'nonVegi') {

      return calcRecipePart - campVegis;

    }

    return calcRecipePart;

  }



}
