import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, QueryFn, DocumentChangeAction, DocumentSnapshot, Action } from '@angular/fire/firestore';
import { Observable, OperatorFunction } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Camp } from '../_class/camp';
import { FirestoreCamp } from '../_interfaces/firestore-camp';
import { User } from '../_interfaces/user';
import { FirebaseObject } from '../_class/firebaseObject';
import { Meal } from '../_class/meal';
import { FirestoreMeal } from '../_interfaces/firestore-meal';

/**
 * DatabaseService
 */
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private db: AngularFirestore, private auth: AngularFireAuth) { }

  /** Returns the current User of the database  */
  public getCurrentUser(): Observable<User> {

    return this.auth.authState.pipe(
      map((userData) => {
        return { firstName: userData.displayName, lastName: userData.displayName, uid: userData.uid, email: userData.email };
      })
    );

  }

  /** returns a Observable of the camps the currentUser can eddit*/
  public getEditableCamps(): Observable<Camp[]> {

    return this.createAccessQueryFn()
      .pipe(mergeMap(queryFn =>
        this.requestCollection('camps', queryFn)
          .pipe(this.createCamps())
      ));

  }

  public getCampById(campId: string): Observable<Camp> {

    return this.requestDocument('camps/' + campId).pipe(this.createCamp());

  }

  public getMealById(mealId: string): Observable<Meal> {

    return this.requestDocument('meals/' + mealId).pipe(this.createMeal());

  }


  /** Updates an element in the database */
  public updateDocument(firebaseObject: Partial<any>, documentPath: string) {

    return this.db.doc(documentPath).update(firebaseObject);

  }


  /** adds any Partial to the database */
  // TODO: only add FirebaseObjects
  public addDocument(firebaseObject: Partial<any>, collectionPath: string) {

    return this.db.collection(collectionPath).add(firebaseObject);

  }


  /** deletes any FirebaseObject form the database*/
  public deleteDocument(firebaseObject: FirebaseObject) {

    return this.db.doc(firebaseObject.getDocPath()).delete();

  }

  public requestDocument(path: string): Observable<Action<DocumentSnapshot<unknown>>> {

    return this.db.doc(path).snapshotChanges();

  }

  public requestCollection(path: string, queryFn?: QueryFn): Observable<DocumentChangeAction<unknown>[]> {

    return this.db.collection(path, queryFn).snapshotChanges();

  }


  //*********************************************************************************************
  //*********************************************************************************************
  //*********************************************************************************************


  /** creates a query function for access restriction (using the currentUser) */
  private createAccessQueryFn(): Observable<QueryFn> {

    return this.getCurrentUser().pipe(map(user =>
      (collRef => collRef.where('access.owner', "array-contains", user.uid))
    ));

  }

  /** creates the camp objects */
  private createCamps(): OperatorFunction<DocumentChangeAction<FirestoreCamp>[], Camp[]> {

    return map(docChangeAction => docChangeAction.map(docData => new Camp(docData.payload.doc.data(), docData.payload.doc.id)));

  }

  /**  */
  private createCamp(): OperatorFunction<Action<DocumentSnapshot<FirestoreCamp>>, Camp> {

    return map(docSnapshot => new Camp(docSnapshot.payload.data(), docSnapshot.payload.id));

  }

  /**  */
  private createMeal(): OperatorFunction<Action<DocumentSnapshot<FirestoreMeal>>, Meal> {

    return map(docSnapshot => new Meal(docSnapshot.payload.data(), docSnapshot.payload.id));

  }

}