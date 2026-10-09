import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AngularFireFunctions} from '@angular/fire/compat/functions';
import {firstValueFrom, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import {environment} from '../../../../environments/environment';
import {HelpMessage} from '../../application-module/services/help.service';
import FieldValue = firebase.firestore.FieldValue;
import Timestamp = firebase.firestore.Timestamp;

export interface FeedbackMessage {
  id: string;
  uid: string;
  email: string;
  message: string;
  date_added: Timestamp;
  displayName?: string;
  title?: string;
  currentURL?: string;
  resolved?: boolean;
  date_resolved?: Timestamp;
}

/**
 * Counters of the document sharedData/statistics, they are updated by the cloud functions.
 */
export interface Statistics {
  user_count?: number;
  removed_old_exports?: number;
  old_week?: { removed_old_exports?: number };
  last_backup_created?: Timestamp;
}

export interface SpellingCorrection {
  from: string;
  to: string;
}

export interface FoodCategoryDecision {
  food_item: string;
  category_name: string;
}

/**
 * The document sharedData/foodCategories. The PDF export fills the first two lists, the others are the decisions
 * of the admins, see backend/pdf-export-module/script/shopping_list/admin_decisions.py.
 */
export interface FoodCategories {
  uncategorised: string[];
  resentCorrections: SpellingCorrection[];
  categories: FoodCategoryDecision[];
  ignored: string[];
  acceptedCorrections: SpellingCorrection[];
  rejectedCorrections: string[];
}

export type HelpMessageWithId = HelpMessage & { id: string };

export interface UserLookupCamp {
  id: string;
  name: string;
  year: string;
  role: string;
  days: number;
  firstDay: number | null;
  lastChange: number | null;
}

export interface UserLookupResult {
  uid: string;
  displayName: string;
  email: string;
  visibility: string;
  created: string | null;
  lastSignIn: string | null;
  providers: string[];
  camps: UserLookupCamp[];
  meals: number;
  recipes: number;
}

const FEEDBACK = '/sharedData/feedback/messages';
const HELP_MESSAGES = '/sharedData/helpMessages/messages';
const FOOD_CATEGORIES = '/sharedData/foodCategories';

/**
 * Data access of the admin dashboard. The Firestore rules only allow it for users with the claim isAdmin.
 */
@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private db: AngularFirestore,
              private functions: AngularFireFunctions,
              private fireAuth: AngularFireAuth) {
  }

  getStatistics(): Observable<Statistics> {
    return this.db.doc<Statistics>('/sharedData/statistics').valueChanges().pipe(map(data => data ?? {}));
  }

  getFeedbackMessages(): Observable<FeedbackMessage[]> {
    return this.db.collection<FeedbackMessage>(FEEDBACK, ref => ref.orderBy('date_added', 'desc'))
      .valueChanges({idField: 'id'});
  }

  countOpenFeedbackMessages(): Observable<number> {
    return this.getFeedbackMessages().pipe(map(messages => messages.filter(message => !message.resolved).length));
  }

  /**
   * Marks a feedback message as resolved. The message is kept, so it stays known what has been reported.
   */
  resolveFeedbackMessage(id: string) {
    return this.db.doc(FEEDBACK + '/' + id).update({resolved: true, date_resolved: FieldValue.serverTimestamp()});
  }

  reopenFeedbackMessage(id: string) {
    return this.db.doc(FEEDBACK + '/' + id).update({resolved: false, date_resolved: FieldValue.delete()});
  }

  getFoodCategories(): Observable<FoodCategories> {
    return this.db.doc<Partial<FoodCategories>>(FOOD_CATEGORIES).valueChanges().pipe(map(data => ({
      uncategorised: data?.uncategorised ?? [],
      resentCorrections: data?.resentCorrections ?? [],
      categories: data?.categories ?? [],
      ignored: data?.ignored ?? [],
      acceptedCorrections: data?.acceptedCorrections ?? [],
      rejectedCorrections: data?.rejectedCorrections ?? []
    })));
  }

  /**
   * The names of the categories of the shopping list. They are defined in categories.csv of the PDF export.
   */
  async getCategoryNames(): Promise<string[]> {

    const user = await firstValueFrom(this.fireAuth.authState);
    const response = await fetch(environment.exportEndpoint + '/shopping_list/categories',
      {headers: {Authorization: 'Bearer ' + await user.getIdToken()}});

    if (!response.ok) {
      throw new Error('Could not load the categories: ' + response.status);
    }

    return response.json();

  }

  assignCategory(food: string, category: string) {
    return this.updateFoodCategories({
      uncategorised: FieldValue.arrayRemove(food),
      categories: FieldValue.arrayUnion({food_item: food, category_name: category})
    });
  }

  /**
   * The name is no food item, the export does not report it again.
   */
  ignoreFood(food: string) {
    return this.updateFoodCategories(
      {uncategorised: FieldValue.arrayRemove(food), ignored: FieldValue.arrayUnion(food)});
  }

  /**
   * The correction is fine, the export does not report it again.
   */
  acceptCorrection({from, to}: SpellingCorrection) {
    return this.updateFoodCategories({
      resentCorrections: FieldValue.arrayRemove({from, to}),
      acceptedCorrections: FieldValue.arrayUnion({from, to})
    });
  }

  /**
   * The name was spelled correctly, the export does not correct it anymore.
   */
  rejectCorrection({from, to}: SpellingCorrection) {
    return this.updateFoodCategories({
      resentCorrections: FieldValue.arrayRemove({from, to}),
      rejectedCorrections: FieldValue.arrayUnion(from)
    });
  }

  /**
   * Withdraws a decision.
   *
   * @param list the field of the decision
   * @param entry as it is saved in the list
   */
  removeDecision(list: 'categories' | 'ignored' | 'acceptedCorrections' | 'rejectedCorrections',
                 entry: string | SpellingCorrection | FoodCategoryDecision) {
    return this.updateFoodCategories({[list]: FieldValue.arrayRemove(entry)});
  }

  getHelpMessages(): Observable<HelpMessageWithId[]> {
    return this.db.collection<HelpMessage>(HELP_MESSAGES).valueChanges({idField: 'id'});
  }

  /**
   * @param id of the document, a new help message has none
   * @returns the id of the document
   */
  async saveHelpMessage(id: string | undefined, message: HelpMessage): Promise<string> {

    if (id === undefined) {
      return (await this.db.collection(HELP_MESSAGES).add(message)).id;
    }

    await this.db.doc(HELP_MESSAGES + '/' + id).set(message);
    return id;

  }

  deleteHelpMessage(id: string) {
    return this.db.doc(HELP_MESSAGES + '/' + id).delete();
  }

  /**
   * Searches users by uid, email or the beginning of the email or the name, see the cloud function findUsers.
   */
  async findUsers(query: string): Promise<UserLookupResult[]> {
    return (await firstValueFrom(this.functions.httpsCallable('findUsers')({query}))).data;
  }

  private updateFoodCategories(changes: { [field in keyof FoodCategories]?: FieldValue }) {
    return this.db.doc(FOOD_CATEGORIES).update(changes);
  }

}
