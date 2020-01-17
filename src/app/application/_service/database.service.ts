import { Injectable } from '@angular/core';
import { Action, AngularFirestore, DocumentChangeAction, DocumentSnapshot, QueryFn } from '@angular/fire/firestore';
import { Observable, OperatorFunction, combineLatest, of } from 'rxjs';
import { map, mergeMap, } from 'rxjs/operators';
import { Camp } from '../_class/camp';
import { FirebaseObject } from '../_class/firebaseObject';
import { Meal } from '../_class/meal';
import { Recipe } from '../_class/recipe';
import { SpecificMeal } from '../_class/specific-meal';
import { SpecificRecipe } from '../_class/specific-recipe';
import { FirestoreCamp } from '../_interfaces/firestore-camp';
import { FirestoreMeal } from '../_interfaces/firestore-meal';
import { FirestoreRecipe } from '../_interfaces/firestore-recipe';
import { FirestoreSpecificRecipe } from '../_interfaces/firestore-specific-recipe';
import { AuthenticationService } from './authentication.service';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AccessData } from '../_interfaces/accessData';
import { RawMealData, ErrorOnImport } from '../_interfaces/rawMealData';
import { User } from '../_interfaces/user';
import { firestore } from 'firebase';

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


  // *********************************************************************************************
  // private static methodes
  // *********************************************************************************************

  /** creates the camp objects */
  private static createCamps(): OperatorFunction<DocumentChangeAction<FirestoreCamp>[], Camp[]> {

    return map(docChangeAction =>
      docChangeAction.map(docData => new Camp(docData.payload.doc.data(), docData.payload.doc.id)));

  }

  /** creates the meals objects */
  private static createMeals(): OperatorFunction<DocumentChangeAction<FirestoreMeal>[], Meal[]> {

    return map(docChangeAction =>
      docChangeAction.map(docData => new Meal(docData.payload.doc.data(), docData.payload.doc.id)));

  }

  /** creates a recipe object */
  private static createRecipe(mealId: string, dbService: DatabaseService, specificMealId?: string, campId?: string):
    OperatorFunction<DocumentChangeAction<FirestoreRecipe>[], Recipe[]> {

    return map(docChangeAction =>
      docChangeAction.map(docData => {
        const recipeId = docData.payload.doc.id;
        return new Recipe(docData.payload.doc.data(), recipeId, mealId,
          dbService.getSpecificRecipe(mealId, specificMealId, campId, recipeId));
      }));

  }

  /**  */
  private static createCamp(): OperatorFunction<Action<DocumentSnapshot<FirestoreCamp>>, Camp> {

    return map(docSnapshot => new Camp(docSnapshot.payload.data(), docSnapshot.payload.id));

  }

  /**  */
  private static createMeal(recipes: Observable<Recipe[]>): OperatorFunction<Action<DocumentSnapshot<FirestoreMeal>>, Meal> {

    return map(docSnapshot => new Meal(docSnapshot.payload.data(), docSnapshot.payload.id, recipes));

  }

  /** */
  private static createSpecificMeal(path: string): OperatorFunction<Action<DocumentSnapshot<SpecificMeal>>, SpecificMeal> {

    return map(docData => new SpecificMeal(docData.payload.data(), path));

  }

  /** */
  private static createSpecificRecipe(path: string, specificMealId: string, campId: string, databaseService: DatabaseService):
    OperatorFunction<Action<DocumentSnapshot<FirestoreSpecificRecipe>>, SpecificRecipe> {

    return map(docData => {

      let specificRecipe: FirestoreSpecificRecipe = docData.payload.data();

      if (specificRecipe === undefined) {
        // erstelle ein neues Dokument und gebe die Daten zurück.
        specificRecipe = SpecificRecipe.createEmptySpecificRecipe(campId, specificMealId);
        databaseService.addDocument(specificRecipe, path);
      }

      return new SpecificRecipe(specificRecipe, path);

    });

  }


  // *********************************************************************************************
  // public none-static methodes
  // *********************************************************************************************

  /**
   * An angular service to provide data form the AngularFirestore database.
   * This service includes methodes to fetch all kind of firebaseObjects form
   * the database.
   *
   * @param db AngularFirestore: the database
   * @param auth AngularFireAuth
   */
  constructor(private db: AngularFirestore, private authService: AuthenticationService, private functions: AngularFireFunctions) { }

  public updateAccessData(access: AccessData, path: string) {

    this.db.doc(path).set({ access }, { merge: true });

  }
  /**
   *
   * @param userIDs
   */
  public getUsers(access: AccessData): Observable<User[]> {

    const arrayOfUsers = Object.keys(access).map(userID => this.getUserById(userID));
    return combineLatest(arrayOfUsers);

  }

  public updateUser(doc: any, uid: string) {

    this.db.doc('users/' + uid).update(doc);

  }
  /**
   *
   */
  public getUserById(userId: string): Observable<User> {

    return this.requestDocument('users/' + userId).pipe(map((docRef: any) => {

      const user: User = {
        displayName: docRef.payload.data().displayName,
        email: docRef.payload.data().email,
        visibility: docRef.payload.data().visibility,
        uid: userId
      };

      return user;

    }));

  }

  /**
   * Löscht ein Rezept und seine SpecificRecipes
   *
   */
  public deleteRecipe(mealId: string, recipeId: string) {

    this.db.doc(Recipe.getPath(mealId, recipeId)).delete();
    this.db.collection(SpecificRecipe.getCollectionPath(mealId, recipeId)).get()
      .subscribe(
        docRefs => docRefs.forEach(docRef => docRef.ref.delete())
      );

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



  /**
   * Creates a new empty meal for the current user. The current user got onwer rights.
   */
  public addNewMeal() {

    this.authService.getCurrentUser().subscribe(user =>
      this.db.collection(Meal.getCollectionPath())
        .add(Meal.getEmptyMeal([user.uid as string]))
    );

  }


  /**
   * Fügt ein neues Rezept mit dem übergebenen Titel und den gegeben AccessData hinzu.
   */
  public addNewRecipe(mealId: string, access?: AccessData, name?: string) {

    return this.db.collection(Recipe.getCollectionPath(mealId))
      .add(Recipe.getEmptyRecipe(name, access));

  }


  /**
   * @return loads the specific meal
   */
  public getSpecificMeal(mealId: string, specificMealId: string, campId: string): Observable<SpecificMeal> {

    const path = SpecificMeal.getPath(mealId, specificMealId);
    return this.requestDocument(path)
      .pipe(DatabaseService.createSpecificMeal(path));

  }

  /** @return loads the specific recipe */
  public getSpecificRecipe(mealId: string, specificMealId: string, campId: string, recipeId: string): Observable<SpecificRecipe> {

    const path = SpecificRecipe.getPath(mealId, recipeId, specificMealId);
    return this.requestDocument(path)
      .pipe(DatabaseService.createSpecificRecipe(path, specificMealId, campId, this));

  }

  /** @returns a Observable of the camps the currentUser can eddit */
  public getEditableCamps(): Observable<Camp[]> {

    return this.createAccessQueryFn()
      .pipe(mergeMap(queryFn =>
        this.requestCollection(Camp.getCollectionPath(), queryFn)
          .pipe(DatabaseService.createCamps())
      ));

  }

  public getEditableMeals(): Observable<Meal[]> {
    return this.createAccessQueryFn()
      .pipe(mergeMap(queryFn =>
        this.requestCollection(Meal.getCollectionPath(), queryFn)
          .pipe(DatabaseService.createMeals())
      ));
  }

  /**
   * fetch the mealInfos for a given camp,
   * using a cloud function to create this infos.
   *
   * @retuns mealsInfo
   */
  public getMealsInfoExport(id: string): Observable<any> {

    return this.functions.httpsCallable('getMealsInfoExport')({ campId: id });

  }

  /** */
  public getCampInfoExport(id: string): Observable<any> {

    return this.functions.httpsCallable('getCampInfoExport')({ campId: id });

  }

  /**
   * @return the shoppingList generated by a CloudFunction
   */
  public getShoppingList(id: string): Observable<any> {

    return this.functions
      .httpsCallable('getShoppingList')({ campId: id })
      .pipe(map(this.transformToShoppingList()));

  }

  /**
   * @returns observable list of all recipes form the current meal.
   *
   * @param mealId id of the current meal
   * @param campId id of the current camp
   */
  public getRecipes(mealId: string, specificMealId?: string, campId?: string): Observable<Recipe[]> {

    return this.createAccessQueryFn()
      .pipe(mergeMap(queryFn =>
        this.requestCollection(Recipe.getCollectionPath(mealId), queryFn)
          .pipe(DatabaseService.createRecipe(mealId, this, specificMealId, campId))
      ));


  }



  public getCampById(campId: string): Observable<Camp> {

    return this.requestDocument(Camp.getPath(campId)).pipe(DatabaseService.createCamp());

  }

  public getMealById(mealId: string, specificMealId: string, campId: string): Observable<Meal> {

    return this.requestDocument(Meal.getPath(mealId)).pipe(
      DatabaseService.createMeal(this.getRecipes(mealId, specificMealId, campId))
    );

  }

  /** Updates an element in the database */
  public updateDocument(firebaseObject: Partial<any>, documentPath: string) {

    return this.db.doc(documentPath).set(firebaseObject);

  }

  /**
   *  adds any Partial to the database
   * @param path the path can be a document path or a collection path
   */
  public async addDocument(firebaseObject: Partial<any>, path: string): Promise<firebase.firestore.DocumentReference> {

    if ((path.match(/\//g) || []).length % 2 === 0) {
      return await this.db.collection(path).add(firebaseObject);
    }

    this.db.doc(path).set(firebaseObject);
    return this.db.doc(path).ref;

  }

  /** deletes any FirebaseObject form the database */
  public deleteDocument(firebaseObject: FirebaseObject) {

    return this.db.doc(firebaseObject.getDocPath()).delete();

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
  private createAccessQueryFn(): Observable<QueryFn> {

    return this.authService.getCurrentUser().pipe(map(user =>
      (collRef => collRef
        .where('access.' + user.uid, 'in', ['editor', 'owner'])
      )));

  }


  private transformToShoppingList(): (value: any, index: number) => { shoppingList: any[]; error: any; } {

    return response => {
      const ings = response.data;
      const arry = {};
      for (const ing in ings) {
        if (ing) {
          if (!arry[ings[ing].category]) {
            arry[ings[ing].category] = [];
          }
          arry[ings[ing].category].push({
            food: ing,
            measure: ings[ing].measure.toFixed(2),
            unit: ings[ing].unit
          });
        }
      }
      const data = { shoppingList: arry, error: response.error };
      const cats = data.shoppingList;
      const array = [];
      for (const cat in cats) {
        if (cat) {
          array.push({
            name: cat,
            ingredients: cats[cat]
          });
        }
      }
      return { shoppingList: array, error: data.error };
    };

  }




}
