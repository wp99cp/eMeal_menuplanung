import { Injectable } from '@angular/core';
import { Action, AngularFirestore, DocumentChangeAction, DocumentSnapshot, QueryFn } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFireStorage } from '@angular/fire/storage';
import { firestore } from 'firebase';
import { combineLatest, forkJoin, Observable, OperatorFunction } from 'rxjs';
import { map, mergeMap, take } from 'rxjs/operators';

import { Camp } from '../_class/camp';
import { FirestoreObject } from '../_class/firebaseObject';
import { Meal } from '../_class/meal';
import { Recipe } from '../_class/recipe';
import { SpecificMeal } from '../_class/specific-meal';
import { SpecificRecipe } from '../_class/specific-recipe';
import { User } from '../_class/user';
import {
  AccessData,
  FirestoreCamp,
  FirestoreDocument,
  FirestoreMeal,
  FirestoreRecipe,
  FirestoreSpecificMeal,
  FirestoreSpecificRecipe,
  FirestoreUser,
} from '../_interfaces/firestoreDatatypes';
import { ErrorOnImport, RawMealData } from '../_interfaces/rawMealData';
import { AuthenticationService } from './authentication.service';

/**
 * An angular service to provide data form the AngularFirestore database.
 * This service includes methodes to fetch all kind of firebaseObjects form
 * the database.
 *
 */
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  /**
   * An angular service to provide data form the AngularFirestore database.
   * This service includes methodes to fetch all kind of firebaseObjects form
   * the database.
   *
   * @param db AngularFirestore: the database
   * @param auth AngularFireAuth
   */
  constructor(
    private db: AngularFirestore,
    private authService: AuthenticationService,
    private functions: AngularFireFunctions,
    private cloud: AngularFireStorage) { }

  public updateAccessData(access: AccessData, path: string) {

    this.db.doc(path).set({ access }, { merge: true });

  }


  /**
   * gets the last 5 Elements
   */
  public getExports(campId: string): Observable<ExportData[]> {

    return this.db.collection('camps/' + campId + '/exports', query => query.orderBy('exportDate', 'desc').limit(6))
      .snapshotChanges().pipe(this.getPathsToCloudDocuments());

  }

  public getVisibleUsers() {

    return this.db.collection('users', collRef => collRef.where('visibility', '==', 'visible')).snapshotChanges().pipe(take(2))
      // Create new Users out of the data
      .pipe(map(docActions => docActions.map(docRef =>
        docRef.payload.doc.data() as FirestoreUser
      )));

  }


  /**
   *
   * @param userIDs
   */
  public getUsers(access: AccessData): Observable<User[]> {

    const arrayOfUsers = Object.keys(access).map(userID => this.getUserById(userID));
    return combineLatest(arrayOfUsers);

  }


  /**
   *
   */
  public getUserById(userId: string): Observable<User> {

    return this.requestDocument('users/' + userId).pipe(map((docRef: any) =>
      new User(docRef.payload.data() as FirestoreUser, userId)
    ));

  }

  /**
   * Löscht ein Rezept und seine SpecificRecipes
   *
   */
  public removeRecipe(specificId: string, recipeId: string) {

    this.db.doc('recipes/' + recipeId).update({
      meals: firestore.FieldValue.arrayRemove(specificId)
    });
    this.db.collection('recipes/' + recipeId + '/specificRecipes/' + specificId).get()
      .subscribe(docRefs => docRefs.forEach(docRef => docRef.ref.delete()));

  }

  /**
   * TODO: hier entsteht eine Sicherheitslücke.
   * Firestore lässt es zurzeit nicht zu, dass dem
   * Query noch ein accessQuery mitgeschickt wird.
   * Dadurch muss auf den accessCheck bei einem GroupQuery
   * verzeichtet werden.
   *
   * Dieses Sicherheitsrisiko ist kurzfristig aber
   * vertrettbar, da für den Query die Id eines bestehenden
   * Rezeptes bekannt sein muss.
   *
   * In Zukunft sollt man sich hier aber Gedanken machen,
   * wie die Situation verbessert werden kann.
   *
   * Achtung: benötigt einen Zusammengesetzten-Index
   *
   */
  public getSpecificMeals(campId: string, dayTimestamp: firestore.Timestamp): Observable<SpecificMeal[]> {

    const queryFn = this.createQuery(
      ['used_in_camp', '==', campId],
      ['meal_date', '==', dayTimestamp]
    );

    return this.db.collectionGroup('specificMeals', queryFn).snapshotChanges()
      .pipe(FirestoreObject.createObjects<FirestoreSpecificMeal, SpecificMeal>(SpecificMeal));

  }


  public addFeedback(feedback: any) {

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://emeal.zh11.ch/services/sendMailToTrello.php', true);

    // Send the proper header information along with the request
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = function () { // Call a function when the state changes.
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        // Request finished. Do processing here.
      }
    }
    xhr.send('title=' + feedback.title + '&feedback=' + feedback.feedback);

  }


  public deleteSpecificMealAndRecipes(mealId: string, specificMealId: string) {

    this.db.doc('meals/' + mealId + '/specificMeals/' + specificMealId).delete();
    this.db.collectionGroup('specificRecipes', collRef => collRef.where('specificMealId', '==', specificMealId)).get()
      .subscribe(
        docRefs => docRefs.forEach(docRef => docRef.ref.delete())
      );

  }

  public importRecipe(url: string): Promise<RawMealData | ErrorOnImport> {

    url = 'https://emeal.zh11.ch/services/loadContent.php?url=' + url;

    const options = {
      method: 'GET',
      headers: [
        ['Content-Type', 'application/json, charset=utf-8'],
      ],
    };

    return fetch(url, options).then(res => res.json());

  }


  public addRecipe(recipeId: string, mealId: string) {

    return this.db.doc('recipes/' + recipeId)
      .update({ meals: firestore.FieldValue.arrayUnion(mealId) });

  }


  /**
   * @return loads the specific meal
   */
  public getSpecificMeal(mealId: string, specificMealId: string): Observable<SpecificMeal> {

    return this.requestDocument('meals/' + mealId + '/specificMeal/' + specificMealId)
      .pipe(FirestoreObject.createObject<FirestoreSpecificMeal, SpecificMeal>(SpecificMeal));

  }

  /** @return loads the specific recipe */
  public getSpecificRecipe(mealId: string, specificMealId: string, recipeId: string): Observable<SpecificRecipe> {

    return this.requestDocument('meals/' + mealId + '/specificMeal/' + specificMealId)
      .pipe(FirestoreObject.createObject<FirestoreSpecificRecipe, SpecificRecipe>(SpecificRecipe));

  }

  /** @returns a Observable of the camps the currentUser can eddit */
  public getEditableCamps(): Observable<Camp[]> {

    return this.createAccessQueryFn()
      .pipe(mergeMap(queryFn =>
        this.requestCollection('camps/', queryFn)
          .pipe(FirestoreObject.createObjects<FirestoreCamp, Camp>(Camp))
      ));

  }

  public getEditableMeals(): Observable<Meal[]> {
    return this.createAccessQueryFn()
      .pipe(mergeMap(queryFn =>
        this.requestCollection('meals/', queryFn)
          .pipe(FirestoreObject.createObjects<FirestoreMeal, Meal>(Meal))
      ));
  }

  /** */
  public exportCamp(id: string): Observable<any> {

    return this.functions.httpsCallable('exportCampData')({ campId: id });

  }

  public createPDF(id: string): Observable<any> {

    return this.functions.httpsCallable('createPDF')({ campId: id });

  }

  /**
   * @returns observable list of all recipes form the current meal.
   *
   * @param mealId id of the current meal
   * @param campId id of the current camp
   */
  public getRecipes(mealId: string): Observable<Recipe[]> {

    return this.createAccessQueryFn(['meals', 'array-contains', mealId])
      .pipe(mergeMap(queryFn =>
        this.requestCollection('recipes', queryFn)
          .pipe(FirestoreObject.createObjects<FirestoreRecipe, Recipe>(Recipe))
      ));


  }

  /**
   * @returns observable list of all recipes form the current meal.
   *
   * @param mealId id of the current meal
   * @param campId id of the current camp
   */
  public getEditableRecipes(): Observable<Recipe[]> {

    return this.createAccessQueryFn()
      .pipe(mergeMap(queryFn =>
        this.requestCollection('recipes', queryFn)
          .pipe(FirestoreObject.createObjects<FirestoreRecipe, Recipe>(Recipe))
      ));

  }

  public getCampById(campId: string): Observable<Camp> {

    return this.requestDocument('camps/' + campId).pipe(FirestoreObject.createObject<FirestoreCamp, Camp>(Camp));

  }

  public getMealById(mealId: string): Observable<Meal> {

    return this.requestDocument('meal/' + mealId).pipe(
      FirestoreObject.createObject<FirestoreMeal, Meal>(Meal)
    );

  }

  /**
   * Updates an element in the database.
   *
   */
  public updateDocument(firebaseObject: FirestoreObject) {

    console.log('Update document: ' + firebaseObject.path);
    console.log(firebaseObject.toFirestoreDocument());

    return this.db.doc(firebaseObject.path).update(firebaseObject.toFirestoreDocument());

  }

  /**
   * adds any Partial to the database
   * @param collectionPath the path can be a document path or a collection path
   */
  public async addDocument(firebaseDocuemnt: FirestoreDocument, collectionPath: string, documentId?: string):
    Promise<firebase.firestore.DocumentReference> {

    if (documentId === undefined) {
      return await this.db.collection(collectionPath).add(firebaseDocuemnt);

    }

    this.db.doc(collectionPath + '/' + documentId).set(firebaseDocuemnt);
    return this.db.doc(collectionPath).ref;

  }

  /** deletes a Camp form the database */
  public deleteDocument(obj: FirestoreObject) {

    return this.db.doc(obj.path).delete();

  }

  public requestDocument(path: string): Observable<Action<DocumentSnapshot<unknown>>> {

    return this.db.doc(path).snapshotChanges();

  }

  public requestCollection(path: string, queryFn?: QueryFn): Observable<DocumentChangeAction<unknown>[]> {

    return this.db.collection(path, queryFn).snapshotChanges();

  }


  // *********************************************************************************************
  // private methodes
  // *********************************************************************************************


  /** creates a query function for access restriction (using the currentUser) */
  private createAccessQueryFn(...querys: [string, firestore.WhereFilterOp, any][]): Observable<QueryFn> {

    return this.authService.getCurrentUser().pipe(map(user =>

      (collRef => {

        let query = collRef.where('access.' + user.uid, 'in', ['editor', 'owner']);
        query = this.createQueryFn(query, ...querys);
        return query;

      })

    ));

  }

  private createQuery(...querys: [string, firestore.WhereFilterOp, any][]): QueryFn {

    return (collRef => {

      return this.createQueryFn(collRef, ...querys);

    });

  }

  private createQueryFn(query: firestore.Query, ...querys: [string, firestore.WhereFilterOp, any][]) {

    querys.forEach(queryCond => {
      query = query.where(queryCond[0], queryCond[1], queryCond[2]);
    });

    return query;
  }

  private getPathsToCloudDocuments(): OperatorFunction<DocumentChangeAction<ExportDocData>[], ExportData[]> {

    return mergeMap(docChangeAction =>
      forkJoin(docChangeAction.map(docData => {

        const exportDocData = docData.payload.doc.data();

        const pathsObservables: Observable<string[]> = forkJoin(exportDocData.docs.map(docType =>
          this.cloud.ref(exportDocData.path + '.' + docType).getDownloadURL() as Observable<string>)
        );

        return pathsObservables.pipe(map(paths => ({ exportDate: exportDocData.exportDate, paths })));

      }))
    );
  }

}


interface ExportDocData { path: string; docs: string[]; exportDate: any; }
interface ExportData { paths: string[]; exportDate: any; }



