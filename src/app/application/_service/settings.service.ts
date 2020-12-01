import {FirestoreSettings, UserGroups} from '../_interfaces/firestoreDatatypes';
import {DatabaseService} from './database.service';
import {AuthenticationService} from './authentication.service';
import {mergeMap} from 'rxjs/operators';
import {Injectable} from '@angular/core';

/**
 * Settings Service
 *
 * This service offers some functions that can be changed on the settings page of the application.
 * For example it provides a convertion function of a date to it's swiss-date string according to
 * the settings of the user (which format).
 *
 */
@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  public globalSettings: FirestoreSettings = {
    show_templates: true,
  };

  constructor(dbService: DatabaseService, authService: AuthenticationService) {

    authService.getCurrentUser().pipe(mergeMap(user =>
      dbService.loadUserSettings(user.uid)))
      .subscribe(settings => {
        this.globalSettings = settings;
        console.log(settings);
      });

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
    vegiState: UserGroups) {

    if (vegiState === 'vegetarians') {

      return campVegis;
    }

    const calcMealPart = SettingsService.calcMealParticipants(campPart, mealPart, mealOver);
    const calcRecipePart = recipeOver ? recipePart : calcMealPart;

    if (vegiState === 'non-vegetarians') {

      return calcRecipePart - campVegis;

    } else if (vegiState === 'leaders') {

      return 0;
    }

    return calcRecipePart;

  }


}
