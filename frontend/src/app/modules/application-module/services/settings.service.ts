import {FirestoreSettings, UserGroups} from '../interfaces/firestoreDatatypes';
import {AuthenticationService} from './authentication.service';
import {filter, map, mergeMap, tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import buildInfo from '../../../../build';

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

  /** true as long as the user has not opened the changelog of the current version */
  public unseenChangelog: Observable<boolean>;

  private changelogSeen = new Subject<void>();
  private docRef: AngularFirestoreDocument<FirestoreSettings>;

  constructor(private db: AngularFirestore, authService: AuthenticationService) {

    this.globalSettings = authService.getCurrentUser()
      .pipe(tap(console.log))
      .pipe(filter(user => !!user?.uid))
      .pipe(mergeMap(user => this.loadUserSettings(user.uid)));

    this.unseenChangelog = merge(
      this.globalSettings.pipe(map(settings => settings.last_shown_changelog !== buildInfo.version)),
      this.changelogSeen.pipe(map(() => false)));

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
    campLeaders: number,
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

      return campLeaders;
    }

    return calcRecipePart;

  }

  private loadUserSettings(userId: string): Observable<FirestoreSettings> {

    this.docRef = this.db.doc('users/' + userId + '/private/settings');

    return this.docRef.get()
      .pipe(map(docRef => docRef.data() as any))
      .pipe(map(settings => {

        let modified = false;

        // a new account, nothing in the current version is new to it
        if (!settings) {
          settings = {last_shown_changelog: buildInfo.version};
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


  markChangelogAsSeen() {

    this.docRef.update({last_shown_changelog: buildInfo.version});
    this.changelogSeen.next();

  }

}
