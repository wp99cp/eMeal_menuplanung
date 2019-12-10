import { Injectable } from '@angular/core';
import { Action, AngularFirestore, DocumentChangeAction, DocumentSnapshot, QueryFn } from '@angular/fire/firestore';
import { Observable, of, OperatorFunction } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
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
import { AngularFireFunctions } from '@angular/fire/functions';



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
  private static createSpecificMeal(path: string): OperatorFunction<Action<DocumentSnapshot<SpecificMeal>>, SpecificMeal> {

    // TODO: Checken, ob bereits existiert, wenn es bereits existiert, dann anpassen...

    // TODO: ggf. bessere Lösung als '[0]'
    return map(docData => new SpecificMeal(docData.payload.data(), path + '/' + docData.payload.id));

  }

  /** */
  private static createSpecificRecipe(path: string): OperatorFunction<DocumentChangeAction<FirestoreSpecificRecipe>[], SpecificRecipe> {

    // TODO: Checken, ob bereits existiert, wenn es bereits existiert, dann anpassen...

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
  constructor(private db: AngularFirestore, private authService: AuthenticationService, private functions: AngularFireFunctions) { }




  /**
   *
   */
  public addMeal() {

    this.authService.getCurrentUser().subscribe(user => {

      this.db.collection('meals').add({

        access: { owner: [user.uid], editor: [] },
        description: '',
        recipe: '',
        title: 'Neue Mahlzeit'

      });

    });


  }

  public addRecipe(mealId: string, campId: string) {

    this.authService.getCurrentUser().subscribe(user => {

      this.db.collection('meals/' + mealId + '/recipes/').add({

        access: { owner: [user.uid], editor: [] },
        description: '',
        ingredients: [],
        name: 'Neues Rezept'

      }).then(ref => {
        this.db.collection('meals/' + mealId + '/recipes/' + ref.id + '/specificRecipes').add({

          participants: 0,
          campId

        });

      });


    });


  }


  /** @return loads the specific meal */
  public getSpecificMeal(mealId: string, specificMealId: string, campId: string): Observable<SpecificMeal> {

    const path = 'meals/' + mealId + '/specificMeals/' + specificMealId;
    return this.requestDocument(path).pipe(DatabaseService.createSpecificMeal(path));

  }

  /** @return loads the specific recipe */
  public getSpecificRecipe(mealId: string, campId: string, recipeId: string): Observable<SpecificRecipe> {

    const path = 'meals/' + mealId + '/recipes/' + recipeId + '/specificRecipes';

    return this.requestCollection(path, collRef => collRef.where('campId', '==', campId).limit(1))
      .pipe(DatabaseService.createSpecificRecipe(path));

  }

  /** @returns a Observable of the camps the currentUser can eddit */
  public getEditableCamps(): Observable<Camp[]> {

    return this.createAccessQueryFn()
      .pipe(mergeMap(queryFn =>
        this.requestCollection('camps', queryFn)
          .pipe(DatabaseService.createCamps())
      ));

  }

  public getEditableMeals(): Observable<Meal[]> {
    return this.createAccessQueryFn()
      .pipe(mergeMap(queryFn =>
        this.requestCollection('meals', queryFn)
          .pipe(DatabaseService.createMeals())
      ));
  }

  /**
   * fetch the mealInfos for a given camp,
   * using a cloud function to create this infos.
   *
   * @retuns mealsInfo
   */
  public getMealsInfoExport(): Observable<any> {

    return this.functions.httpsCallable('getMealsInfoExport')({});

  }

  /** */
  public getCampInfoExport(id: string): Observable<any> {

    return this.functions.httpsCallable('getCampInfoExport')(
      { campId: id }
    );

  }

  /**
   * @return the shoppingList generated by a CloudFunction
   */
  public getShoppingList(id: string): Observable<any> {

    return this.functions
      .httpsCallable('getShoppingList')({ campId: id })
      .pipe(map(response => {

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

        return { shoppingList: arry, error: response.error };

      }))
      .pipe(map(data => {

        const cats = data.shoppingList;
        const arry = [];

        for (const cat in cats) {

          if (cat) {

            arry.push({
              name: cat,
              ingredients: cats[cat]
            });
          }

        }

        return { shoppingList: arry, error: data.error };

      }));

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
