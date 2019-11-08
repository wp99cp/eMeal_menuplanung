import { Injectable } from '@angular/core';
import { Action, AngularFirestore, DocumentChangeAction, DocumentSnapshot, QueryFn } from '@angular/fire/firestore';
import { Observable, of, OperatorFunction } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Camp } from '../_class/camp';
import { FirebaseObject } from '../_class/firebaseObject';
import { Meal } from '../_class/meal';
import { Recipe } from '../_class/recipe';
import { SpecificMeal } from '../_class/specific-meal';
import { SpecificRecipe } from '../_class/specific-recipe';
import { FirestoreCamp } from '../_interfaces/firestore-camp';
import { FirestoreMeal } from '../_interfaces/firestore-meal';
import { FirestoreRecipe } from '../_interfaces/firestore-recipe';
import { FirestoreSpecificMeal } from '../_interfaces/firestore-specific-meal-data';
import { FirestoreSpecificRecipe } from '../_interfaces/firestore-specific-recipe';
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


  // *********************************************************************************************
  // private static methodes
  // *********************************************************************************************

  /** creates the camp objects */
  private static createCamps(): OperatorFunction<DocumentChangeAction<FirestoreCamp>[], Camp[]> {

    return map(docChangeAction =>
      docChangeAction.map(docData => new Camp(docData.payload.doc.data(), docData.payload.doc.id)));

  }

  /** creates a recipe object */
  private static createRecipe(mealId: string, campId: string, dbService: DatabaseService):
    OperatorFunction<DocumentChangeAction<FirestoreRecipe>[], Recipe[]> {

    return map(docChangeAction =>
      docChangeAction.map(docData => {
        const recipeId = docData.payload.doc.id;
        return new Recipe(docData.payload.doc.data(), recipeId, mealId, dbService.getSpecificRecipe(mealId, campId, recipeId));
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
  private static createSpecificMeal(path: string): OperatorFunction<DocumentChangeAction<FirestoreSpecificMeal>[], SpecificMeal> {

    // TODO: ggf. bessere Lösung als '[0]'
    return map(docChangeAction =>
      docChangeAction.map(docData => new SpecificMeal(docData.payload.doc.data(), path + '/' + docData.payload.doc.id))[0]);

  }

  /** */
  private static createSpecificRecipe(path: string): OperatorFunction<DocumentChangeAction<FirestoreSpecificRecipe>[], SpecificRecipe> {

    // TODO: ggf. bessere Lösung als '[0]'
    return map(docChangeAction =>
      docChangeAction.map(docData => new SpecificRecipe(docData.payload.doc.data(), path + '/' + docData.payload.doc.id))[0]);

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
  constructor(private db: AngularFirestore, private authService: AuthenticationService) { }


  /** @return loads the specific meal */
  public getSpecificMeal(mealId: string, campId: string): Observable<SpecificMeal> {

    const path = 'meals/' + mealId + '/specificMeals';
    return this.requestCollection(path, collRef => collRef.where('campId', '==', campId).limit(1))
      .pipe(DatabaseService.createSpecificMeal(path));

  }

  /** @return loads the specific recipe */
  public getSpecificRecipe(mealId: string, campId: string, recipeId: string): Observable<SpecificRecipe> {

    const path = 'meals/' + mealId + '/recipes/' + recipeId + '/specificRecipes';

    return this.requestCollection(path,
      collRef => collRef.where('campId', '==', campId).limit(1)
    ).pipe(DatabaseService.createSpecificRecipe(path));

  }

  /** @returns a Observable of the camps the currentUser can eddit */
  public getEditableCamps(): Observable<Camp[]> {

    return this.createAccessQueryFn()
      .pipe(mergeMap(queryFn =>
        this.requestCollection('camps', queryFn)
          .pipe(DatabaseService.createCamps())
      ));

  }

  /**
   * fetch the mealInfos for a given camp,
   * using a cloud function to create this infos.
   *
   * @retuns mealsInfo
   */
  public getMealsInfoExport(): Observable<any> {
    return of([
      {
        name: 'Zmittag',
        meal: 'Hörndli und Ghacktes',
        date: 'Mittwoch, 11. November 2019',

        recipes: [
          {
            name: 'Hörndli'
          }
        ]
      }
    ]);
  }

  /** */
  public getCampInfoExport(): Observable<any> {

    return of(
      {
        name: 'Chlauslager 2019'
      }
    );

  }

  /**
   * @return the shoppingList generated by a CloudFunction
   */
  public getShoppingList(): Observable<any> {
    return of([
      {
        name: 'Fleisch',
        ingredients: [
          {
            food: 'Hackfleisch',
            unit: 'kg',
            measure: '2'
          }, {
            food: 'Brätchügeli',
            unit: 'kg',
            measure: '1'
          }, {
            food: 'Brätchügeli',
            unit: 'kg',
            measure: '1'
          }
        ]
      },
      {
        name: 'Gemüse und Früchte',
        ingredients: [
          {
            food: 'Apfel',
            unit: 'kg',
            measure: '2'
          }
        ]
      }
    ]);
  }

  /**
   * @returns observable list of all recipes form the current meal.
   *
   * @param mealId id of the current meal
   * @param campId id of the current camp
   */
  public getRecipes(mealId: string, campId: string): Observable<Recipe[]> {

    return this.createAccessQueryFn()
      .pipe(mergeMap(queryFn =>
        this.requestCollection('meals/' + mealId + '/recipes', queryFn)
          .pipe(DatabaseService.createRecipe(mealId, campId, this))
      ));

  }

  public getCampById(campId: string): Observable<Camp> {

    return this.requestDocument('camps/' + campId).pipe(DatabaseService.createCamp());

  }

  public getMealById(mealId: string, campId: string): Observable<Meal> {

    return this.requestDocument('meals/' + mealId).pipe(
      DatabaseService.createMeal(this.getRecipes(mealId, campId))
    );

  }

  /** Updates an element in the database */
  public updateDocument(firebaseObject: Partial<any>, documentPath: string) {

    return this.db.doc(documentPath).update(firebaseObject);

  }

  /** adds any Partial to the database */
  // TODO: only add FirebaseObjects not Partial<any>
  public addDocument(firebaseObject: Partial<any>, collectionPath: string) {

    return this.db.collection(collectionPath).add(firebaseObject);

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
      (collRef => collRef.where('access.owner', 'array-contains', user.uid))
    ));

  }

}
