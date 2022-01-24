import {FirestoreSettings, UserGroups} from '../interfaces/firestoreDatatypes';
import {AuthenticationService} from './authentication.service';
import {map, mergeMap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/compat/firestore';

/**
 * Settings Service
 *
 * This service offers some functions that can be changed on the settings page of the application-module.
 * For example it provides a conversion function of a date to it's swiss-date string according to
 * the settings of the user (which format).
 *
 */
@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  public globalSettings: Observable<FirestoreSettings>;
  private docRef: AngularFirestoreDocument<FirestoreSettings>;

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

    this.docRef = this.db.doc('users/' + userId + '/private/settings');

    return this.docRef.get()
      .pipe(map(docRef => docRef.data() as any))
      .pipe(map(settings => {

        let modified = false;

        if (!settings) {
          settings = {};
          modified = true;
        }

        if (!settings.hasOwnProperty('show_templates')) {
          settings.show_templates = true;
          modified = true;
        }

        if (!settings.hasOwnProperty('last_shown_changelog')) {
          settings.last_shown_changelog = '';
          modified = true;
        }

        if (!settings.hasOwnProperty('default_participants')) {
          settings.default_participants = 4;
          modified = true;
        }


        if (!settings.hasOwnProperty('experimental_features')) {
          settings.experimental_features = false;
          modified = true;
        }

        if (modified) {
          this.docRef.set(settings);
        }

        return settings;
      }));

  }


  setLastShownChangelog(version: string) {

    this.docRef.update({last_shown_changelog: version});

  }

}
