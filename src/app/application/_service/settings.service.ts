import {FirestoreSettings, UserGroups} from '../_interfaces/firestoreDatatypes';
import {AuthenticationService} from './authentication.service';
import {map, mergeMap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AngularFirestore} from '@angular/fire/firestore';

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

  public globalSettings: Observable<FirestoreSettings>;

  constructor(private db: AngularFirestore, authService: AuthenticationService) {

    this.globalSettings = authService.getCurrentUser().pipe(mergeMap(user =>
      this.loadUserSettings(user.uid)));

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

  private loadUserSettings(userId: string): Observable<FirestoreSettings> {

    return this.db.doc('users/' + userId + '/private/settings').snapshotChanges()
      .pipe(map(docRef => docRef.payload.data() as any))
      .pipe(map(settings =>
        !settings || !settings.hasOwnProperty('show_templates') ? {
          show_templates: true
        } : settings));

  }


}
