import {Injectable} from '@angular/core';
import {
  Action,
  AngularFirestore,
  DocumentChangeAction,
  DocumentReference,
  DocumentSnapshot,
  FieldPath,
  Query,
  QueryFn
} from '@angular/fire/compat/firestore';
import {AngularFireFunctions} from '@angular/fire/compat/functions';
import {AngularFireStorage} from '@angular/fire/compat/storage';
import {combineLatest, EMPTY, forkJoin, Observable, of, OperatorFunction, Subject} from 'rxjs';
import {catchError, delay, filter, map, mergeMap, retryWhen, skip, take, takeUntil} from 'rxjs/operators';
import {Camp} from '../classes/camp';
import {FirestoreObject} from '../classes/firebaseObject';
import {Meal} from '../classes/meal';
import {Recipe} from '../classes/recipe';
import {SpecificMeal} from '../classes/specific-meal';
import {SpecificRecipe} from '../classes/specific-recipe';
import {User} from '../classes/user';
import {
  AccessData,
  FirestoreCamp,
  FirestoreDocument,
  FirestoreMeal,
  FirestoreRecipe,
  FirestoreSettings,
  FirestoreSpecificMeal,
  FirestoreSpecificRecipe,
  FirestoreUser,
  Ingredient
} from '../interfaces/firestoreDatatypes';
import {AuthenticationService} from './authentication.service';
import {NavigationEnd, NavigationStart, Params, Router} from '@angular/router';
import {SettingsService} from './settings.service';
import {environment} from '../../../../environments/environment';
import firebase from "firebase/compat/app";
import FieldValue = firebase.firestore.FieldValue;
import WhereFilterOp = firebase.firestore.WhereFilterOp;
import Timestamp = firebase.firestore.Timestamp;


/**
 * An angular service to provide data form the AngularFirestore database.
 * This service includes methods to fetch all kind of firebaseObjects form
 * the database.
 *
 */
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private routerChanges = new Subject();

  /**
   * An angular service to provide data form the AngularFirestore database.
   * This service includes methods to fetch all kind of firebaseObjects form
   * the database.
   *
   */
  constructor(
    private db: AngularFirestore,
    private authService: AuthenticationService,
    private functions: AngularFireFunctions,
    private cloud: AngularFireStorage,
    private router: Router,
    private settings: SettingsService) {

    // used for automatically unsubscribe if the user changes the page, i.g. leaves the edit section.
    router.events
      .pipe(
        filter(event => event instanceof NavigationStart), // triggers once every navigation event
        skip(1) // ignore first change (on load page)
      ).subscribe((changeRoute: NavigationEnd) => {
      console.log('Trigger unsubscription! URL changed to: ' + changeRoute.url);
      this.routerChanges.next();
    });

  }

  /**
   *
   * Updates the access of a document. <br/>
   * Uses a cloud function to update the access rights. This cloud function automatically edits all related
   * documents. And may return with an error.
   *
   * @param access the new AccessData
   * @param path document path to the document whose access data should be changed
   * @param upgradeOnly should only increase rights, decreases are ignored
   *
   * @return server response as an Observable<any>. This observable completes after one push.
   *
   */
  public updateAccessData(access: AccessData, path: string, upgradeOnly = false) {

    return this.functions.httpsCallable('changeAccessData')(
      {documentPath: path, requestedAccessData: access, upgradeOnly}
    );


  }

  /**
   * This function should be called after adding a meal to a camp.
   * <br/>
   * It calls a cloud function which updates the AccessData of the meal sucht hat all
   * collaborators (viewer, editor, collaborator or owner rights on the camp document)
   * can access the meal data (e.g. gives viewer or editor rights).
   * <br/>
   * It also updates all related recipes and specific docs.
   *
   * @param campId id of the camp
   * @param mealPath path to the added meal
   *
   * @return server response as an Observable<any>. This observable completes after one push.
   *
   */
  public refreshAccessData(campId: string, mealPath: string) {

    return this.functions.httpsCallable('refreshAccessData')(
      {campId, type: 'meal', path: mealPath}
    );

  }

  /**
   *
   * TODO: auto unsubscription
   * TODO: update documentation
   *
   * Gets the last 5 Elements
   *
   *
   *
   */
  public getExports(campId: string): Observable<ExportData[]> {

    return this.db.collection('camps/' + campId + '/exports',
      query => query.orderBy('exportDate', 'desc').limit(6))
      .snapshotChanges()
      .pipe(this.getPathsToCloudDocuments())

      // Retry on error (max 10 times with a delay of 500ms after each try)
      .pipe(
        retryWhen(err => err.pipe(delay(500), take(10))),
        catchError(() => EMPTY)
      );

  }

  /**
   *
   * Returns all visible user and its data as an `Observable<User[]>` object.
   *
   * @param autoUnsubscription specifies weather the db service should automatically unsubscribe the
   * observable on a router change (i.g. navigation). Optional parameter. Default value is true.
   * <br/>
   * <br/>
   *
   * TODO: Hier gibt es ein Information-Leaking:
   * Zur Zeit können somit alle User ausgelesen werden inkl. ihre E-Mail-Adressen.
   * (Es gibt zwar die Möglichkeit, sein eigenes Konto zu verstecken, aber dann
   * kann man auch nicht mehr mit anderen Zusammenarbeiten).
   * <br/>
   *
   * Idee neue Freigabe nur über E-Mailadresse möglich, eine Cloud-Funktion gibt dann
   * den entsprechenden Namen zurück und fügt den User hinzu...
   * Oder aber das ganze muss mindestens in den AGBs/Datenschutzbestimmungen stehen
   * diese müssen unbedingt mal angepasst werden.
   *
   */
  public getVisibleUsers(autoUnsubscription = true) {

    return this.db.collection('users',
      collRef => collRef.where('visibility', '==', 'visible')).snapshotChanges()
      // Create new Users out of the data
      .pipe(map(docActions => docActions.map(docRef =>
        new User(docRef.payload.doc.data() as FirestoreUser, docRef.payload.doc.id))
      ))
      .pipe(this.doAutoUnsubscription(autoUnsubscription));

  }

  /**
   * Returns all users have access as an `Observable<User[]>` object.
   *
   * @param access the AccessData containing the user ids.
   * @param autoUnsubscription specifies weather the db service should automatically unsubscribe the
   * observable on a router change (i.g. navigation). Optional parameter. Default value is true.
   *
   */
  public getUsers(access: AccessData, autoUnsubscription = true): Observable<User[]> {

    const arrayOfUsersObservable = Object.keys(access).map(userID => this.getUserById(userID));
    return combineLatest(arrayOfUsersObservable)
      .pipe(this.doAutoUnsubscription(autoUnsubscription));

  }

  /**
   *
   * Loads the data of a user and returns an`Observable<User>` object.
   *
   * @param userId of the user that should be loaded
   * @param autoUnsubscription specifies weather the db service should automatically unsubscribe the
   * observable on a router change (i.g. navigation). Optional parameter. Default value is true.
   *
   */
  public getUserById(userId: string, autoUnsubscription = true): Observable<User> {

    return this.requestDocument('users/' + userId)
      .pipe(FirestoreObject.createObject<FirestoreUser, User>(User))
      .pipe(this.doAutoUnsubscription(autoUnsubscription));

  }

  /**
   *
   *  Removes a recipe form a meal. If the meal is used in a camp.
   *  This function also deletes the corresponding specificRecipes.
   *
   *  @param mealId id of the meal
   *  @param recipeId id of the recipe to be removed form the meal
   *
   */
  public removeRecipe(mealId: string, recipeId: string): Promise<void> {

    const batch = this.db.firestore.batch();

    batch.update(this.db.doc('recipes/' + recipeId).ref, {
      used_in_meals: FieldValue.arrayRemove(mealId)
    });

    return new Promise<void>(resolve => {

      this.db.collection('recipes/' + recipeId + '/specificRecipes',
        ref => ref.where('used_in_meal', '==', mealId)).get()
        .pipe(take(1))
        .subscribe(docRefs => {
          docRefs.forEach(docRef => batch.delete(docRef.ref));
          resolve(batch.commit());
        });

    });

  }

  /**
   *
   *    * TODO: auto unsubscription

   * TODO: hier entsteht eine Sicherheitslücke.
   * Firestore lässt es zurzeit nicht zu, dass dem
   * Query noch ein accessQuery mitgeschickt wird.
   * Dadurch muss auf den accessCheck bei einem GroupQuery
   * verzichtet werden.
   *
   * Dieses Sicherheitsrisiko ist kurzfristig aber
   * vertretbar, da für den Query die Id eines bestehenden
   * Rezeptes bekannt sein muss.
   *
   * In Zukunft sollt man sich hier aber Gedanken machen,
   * wie die Situation verbessert werden kann.
   *
   * Achtung: benötigt einen Zusammengesetzten-Index
   *
   */
  public getSpecificMeals(campId: string, dayTimestamp: Timestamp): Observable<SpecificMeal[]> {

    const queryFn = this.createQuery(
      ['used_in_camp', '==', campId],
      ['meal_date', '==', dayTimestamp]
    );

    return this.db.collectionGroup('specificMeals', queryFn).snapshotChanges()
      .pipe(FirestoreObject.createObjects<FirestoreSpecificMeal, SpecificMeal>(SpecificMeal));

  }

  /**
   *
   *    * TODO: auto unsubscription

   *
   * TODO: Besser als Cloud Funktion, damit auch wirklich alles gelöscht wird
   * und nicht fehlerhafte Zustände in der Datenbank entstehen...
   *
   * @param mealId
   * @param specificMealId
   */
  public deleteSpecificMealAndRecipes(mealId: string, specificMealId: string) {

    this.db.doc('meals/' + mealId + '/specificMeals/' + specificMealId).delete();

    // https://stackoverflow.com/questions/56149601/firestore-collection-group-query-on-documentid
    // this is a bug in the firestore api...
    this.db.collectionGroup('specificRecipes',
      query => query.where('recipe_specificId', '==', specificMealId))
      .get().subscribe(docRefs => docRefs.forEach(docRef => docRef.ref.delete()));

  }

  /**
   *
   *
   *    * TODO: auto unsubscription

   * Loads a meal form a external website.
   *
   * @param url of the external webpage with the meal data
   *
   */
  public importMeal(url: string): Observable<any> {

    return this.functions.httpsCallable('importMeal')({url});

  }

  /**
   *   * TODO: auto unsubscription

   * @param mealId
   * @param idToAdd
   */
  public addIdToRecipes(mealId: any, idToAdd: any) {

    this.createAccessQueryFn(['editor', 'owner', 'collaborator', 'viewer'], ['used_in_meals', 'array-contains', mealId])
      .pipe(mergeMap(query =>
        this.db.collection('recipes', query).get()
      )).subscribe(docRefs => docRefs.docs.forEach(doc =>
      doc.ref.update({used_in_meals: FieldValue.arrayUnion(idToAdd)})
    ));

  }

  /**
   *
   *    * TODO: auto unsubscription

   * @param recipe
   * @param specificId
   * @param mealId
   * @param camp
   */
  public async addRecipe(recipe: Recipe, specificId: string, mealId: string, camp: Camp) {

    await recipe.createSpecificRecipe(camp, recipe.documentId, mealId, specificId, this);

    return this.db.doc('recipes/' + recipe.documentId)
      .update({used_in_meals: FieldValue.arrayUnion(mealId)});

  }

  /**
   *   * TODO: auto unsubscription

   * @return loads the specific meal
   */
  public getSpecificMeal(mealId: string, specificMealId: string): Observable<SpecificMeal> {

    return this.requestDocument('meals/' + mealId + '/specificMeals/' + specificMealId)
      .pipe(FirestoreObject.createObject<FirestoreSpecificMeal, SpecificMeal>(SpecificMeal));

  }

  /**
   *
   *    * TODO: auto unsubscription

   * @return loads the specific recipe
   *
   */
  public getSpecificRecipe(specificMealId: string, mealId: string, recipe: Recipe, camp: Camp): Observable<SpecificRecipe> {

    return this.loadSpecificRecipe(recipe, mealId, specificMealId, camp)
      .pipe(FirestoreObject.createObject<FirestoreSpecificRecipe, SpecificRecipe>(SpecificRecipe));

  }

  /**
   *
   *    * TODO: auto unsubscription


   * Gets all camps the signed in user has access (i.g. owner, editor, collaborator or viewer rights).
   * The database service automatically unsubscribe the observable on a router navigation.
   * To prevent the auto subscription, pass the the optional argument.
   *
   * @param autoUnsubscription specifies weather the db service should automatically unsubscribe the
   * observable on a router change (i.g. navigation). Optional parameter. Default value is true.
   *
   * @returns a Observable of the camps the currentUser has access to
   *
   */
  public getCampsWithAccess(autoUnsubscription = true): Observable<Camp[]> {

    const campObservable = this.createAccessQueryFn(['editor', 'owner', 'collaborator', 'viewer'])
      .pipe(mergeMap(queryFn => this.requestCollection('camps/', queryFn)))
      .pipe(FirestoreObject.createObjects<FirestoreCamp, Camp>(Camp));

    // no auto unsubscription
    if (!autoUnsubscription) {
      return campObservable;
    }

    // enable auto-unsubscription
    return campObservable.pipe(takeUntil(this.routerChanges)); // automatically unsubscribe on router changes

  }

  /**
   *
   *    * TODO: auto unsubscription

   * @param mealId
   */
  public getCampIDsThatIncludes(mealID: string) {
    return this.getMealById(mealID).pipe(map(camp => camp.usedInCamps));
  }

  /**
   *   * TODO: auto unsubscription

   */
  public getEditableMeals(): Observable<Meal[]> {
    return this.createAccessQueryFn(['editor', 'owner'])
      .pipe(mergeMap(queryFn =>
        this.requestCollection('meals/', queryFn)
          .pipe(FirestoreObject.createObjects<FirestoreMeal, Meal>(Meal))
      ));
  }

  /**
   * @param recipeId
   */
  public getMealIDsThatIncludes(recipeId: string) {
    return this.getRecipeById(recipeId).pipe(map(recipe => recipe.usedInMeals));
  }

  /**
   * Triggers a PDF creation for the specified camp.
   *
   * @param campID: Id of the camp that should be exported.
   *
   * @param optionalSettings Optional settings for the export
   *
   */
  public createPDF(campID: string, optionalSettings: { [id: string]: string } = {'--spl': ''}): Promise<any> {

    console.log(optionalSettings);

    return new Promise((resolve, reject) => {

      this.authService.getCurrentUser().pipe(take(1)).subscribe(user => {

        let queryStr = '?';

        Object.entries(optionalSettings).forEach(([k, v]) => {
          queryStr += k + '=' + v + '&';
        });

        const url = environment.exportEndpoint + '/export/camp/'
          + campID + '/user/' + user.uid + '/' + queryStr;

        console.log('Export: ' + url);

        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = () => {

          console.log('Export status: ', xhr.status);

          if (xhr.status === 200) {
            resolve(xhr.responseText);
          } else {
            reject(new Error(xhr.responseText));
          }
        };
        xhr.send();

      });
    });


  }

  /**
   *
   *    * TODO: auto unsubscription

   * @returns observable list of all recipes form the current meal.
   *
   * @param mealId id of the current meal
   * @param campId id of the current camp
   */
  public getRecipes(mealId: string): Observable<Recipe[]> {

    const recipesCreatedByUsers = this.createAccessQueryFn(['editor', 'owner', 'collaborator', 'viewer'],
      ['used_in_meals', 'array-contains', mealId])
      .pipe(mergeMap(queryFn => this.requestCollection('recipes', queryFn)))
      .pipe(FirestoreObject.createObjects<FirestoreRecipe, Recipe>(Recipe));

    const globalTemplates = this.requestCollection('recipes', ref => ref
      .where('access.all_users', 'in', ['viewer'])
      .where('used_in_meals', 'array-contains', mealId))
      .pipe(FirestoreObject.createObjects<FirestoreRecipe, Recipe>(Recipe));

    return combineLatest([recipesCreatedByUsers, globalTemplates])
      .pipe(map(arr => arr.flat()));

  }

  /**
   *
   *    * TODO: auto unsubscription

   * @returns observable list of all recipes form the current meal.
   *
   * @param mealId id of the current meal
   * @param campId id of the current camp
   */
  public getEditableRecipes(): Observable<Recipe[]> {

    return this.createAccessQueryFn(['editor', 'owner', 'collaborator'])
      .pipe(mergeMap(queryFn =>
        this.requestCollection('recipes', queryFn)
          .pipe(FirestoreObject.createObjects<FirestoreRecipe, Recipe>(Recipe))
      ));

  }

  /**
   *
   *    * TODO: auto unsubscription


   * @returns observable list of all accessable meals (includes viewer access)
   *
   */
  public getAccessableRecipes(params: Observable<Params>): Observable<Recipe[]> {

    return combineLatest([this.settings.globalSettings.pipe(take(1)), params])
      .pipe(mergeMap(([settings, params]: [FirestoreSettings, Params]) => {

        const accessLevels = settings.show_templates ?
          ['editor', 'owner', 'collaborator', 'viewer'] :
          ['editor', 'owner', 'collaborator'];

        const onlyTemplates = params?.vorlagen && params['vorlagen'] == '1';

        let recipesCreatedByUsers = of([]);

        // Load Recipes of the user (if not only templates should be loaded).
        if (!onlyTemplates) {
          recipesCreatedByUsers = this.createAccessQueryFn(accessLevels)
            .pipe(mergeMap(queryFn => this.requestCollection('recipes', queryFn)))
            .pipe(FirestoreObject.createObjects<FirestoreRecipe, Recipe>(Recipe));
        }

        // if param 'vorlagen' is active, then templates will be loaded regardless the show_templates settings
        else {
          recipesCreatedByUsers = this.createAccessQueryFn(['viewer'])
            .pipe(mergeMap(queryFn => this.requestCollection('recipes', queryFn)))
            .pipe(FirestoreObject.createObjects<FirestoreRecipe, Recipe>(Recipe));
        }

        // return only recipes created by the user; exclude templates and read only recipes
        if (!settings.show_templates && !onlyTemplates) {
          return recipesCreatedByUsers;
        }

        const globalTemplates = this.requestCollection('recipes', ref =>
          ref.where('access.all_users', 'in', ['viewer']))
          .pipe(FirestoreObject.createObjects<FirestoreRecipe, Recipe>(Recipe));

        return combineLatest([recipesCreatedByUsers, globalTemplates])
          .pipe(map(arr => arr.flat()));

      }));

  }

  public getAccessableMeals(params: Observable<Params>): Observable<Meal[]> {

    return combineLatest([this.settings.globalSettings.pipe(take(1)), params])
      .pipe(mergeMap(([settings, params]: [FirestoreSettings, Params]) => {

        const accessLevels = settings.show_templates ?
          ['editor', 'owner', 'collaborator', 'viewer'] :
          ['editor', 'owner', 'collaborator'];

        const onlyTemplates = params?.vorlagen && params['vorlagen'] == '1';

        let mealsCreatedByUsers = of([]);

        // Load Meals of the user (if not only templates should be loaded).
        if (!onlyTemplates) {
          mealsCreatedByUsers = this.createAccessQueryFn(accessLevels)
            .pipe(mergeMap(queryFn => this.requestCollection('meals', queryFn)))
            .pipe(FirestoreObject.createObjects<FirestoreMeal, Meal>(Meal));
        }
        // if param 'vorlagen' is active, then templates will be loaded regardless the show_templates settings
        else {
          mealsCreatedByUsers = this.createAccessQueryFn(['viewer'])
            .pipe(mergeMap(queryFn => this.requestCollection('meals', queryFn)))
            .pipe(FirestoreObject.createObjects<FirestoreMeal, Meal>(Meal));
        }

        // return only meals created by the user; exclude templates and read only recipes
        if (!settings.show_templates && !onlyTemplates) {
          return mealsCreatedByUsers;
        }

        const globalTemplates = this.requestCollection('meals', ref =>
          ref.where('access.all_users', 'in', ['viewer']))
          .pipe(FirestoreObject.createObjects<FirestoreMeal, Meal>(Meal));

        return combineLatest([mealsCreatedByUsers, globalTemplates])
          .pipe(map(arr => arr.flat()));

      }));
  }

  /**
   *   * TODO: auto unsubscription

   * @param recipeId
   */
  public getRecipeById(recipeId: string): Observable<Recipe> {

    return this.requestDocument('recipes/' + recipeId).pipe(
      FirestoreObject.createObject<FirestoreRecipe, Recipe>(Recipe)
    );

  }

  /**
   *   * TODO: auto unsubscription

   * @param campId
   */
  public getCampById(campId: string): Observable<Camp> {

    return this.requestDocument('camps/' + campId).pipe(FirestoreObject.createObject<FirestoreCamp, Camp>(Camp));

  }

  /**
   *   * TODO: auto unsubscription

   * @param mealId
   */
  public getMealById(mealId: string): Observable<Meal> {

    return this.requestDocument('meals/' + mealId).pipe(
      FirestoreObject.createObject<FirestoreMeal, Meal>(Meal)
    );

  }

  /**
   *   * TODO: auto unsubscription

   * Updates an element in the database.
   *
   */
  public async updateDocument(firebaseObject: FirestoreObject) {

    if (!await this.canWrite(firebaseObject)) {
      console.log('No Access!');
      return null;
    }

    console.log('Update document: ' + firebaseObject.path);
    console.log(firebaseObject.toFirestoreDocument());

    return this.db.doc(firebaseObject.path).update(firebaseObject.toFirestoreDocument());

  }

  /**
   *
   *    * TODO: auto unsubscription

   * Creates of an element. And clears all access data.
   *
   */
  public createCopy(firebaseObject: FirestoreObject, id?: string): Promise<DocumentReference> {

    return new Promise((resolve) =>
      this.authService.getCurrentUser().subscribe(async user => {

        if ((firebaseObject instanceof Recipe || firebaseObject instanceof Meal) &&
          firebaseObject.getAccessData().all_users === 'viewer') {
          firebaseObject.createdFromTemplate = firebaseObject.documentId;
        }

        // deletes specific data
        if (firebaseObject instanceof Recipe) {

          firebaseObject.usedInMeals = [];

          if (id !== undefined) {
            firebaseObject.usedInMeals.push(id);
          }

        }

        // deletes specific data
        if (firebaseObject instanceof Meal) {
          firebaseObject.usedInCamps = [];
        }

        // set current user as owner of the document
        firebaseObject.setAccessData({[user.uid]: 'owner'});


        console.log('Copied document: ');
        console.log(firebaseObject.toFirestoreDocument());

        const collPath = firebaseObject.path.substring(0, firebaseObject.path.indexOf('/'));
        resolve(await this.db.collection(collPath).add(firebaseObject.toFirestoreDocument()));

      }));
  }

  /**
   *
   *    * TODO: auto unsubscription

   *
   * adds any Partial to the database
   * @param collectionPath the path can be a document path or a collection path
   *
   */
  public async addDocument(firebaseDocument: FirestoreDocument, collectionPath: string, documentId?: string):
    Promise<DocumentReference> {


    if (documentId === undefined) {

      return new Promise((resolve) => {

        this.db.collection(collectionPath).add(firebaseDocument)
          .then(res => resolve(res))
          .catch(err => console.log(err));

      });

    }

    return new Promise((resolve) => {
      this.db.doc(collectionPath + '/' + documentId).get().subscribe(async res => {


        if (res.exists) {
          throw new Error('Doc already exist!');
        }

        await this.db.doc(collectionPath + '/' + documentId).set(firebaseDocument);
        resolve(this.db.doc(collectionPath + '/' + documentId).ref);

      });
    });

  }

  /**
   *
   *
   *    * TODO: auto unsubscription

   * @param campId
   */
  public deleteExports(campId: string) {

    this.db.collection('camps/' + campId + '/exports').get()
      .pipe(take(1))
      .subscribe(refs =>
        refs.docs.forEach(docRef =>
          docRef.ref.delete()
        )
      );

  }

  /**
   *
   *
   *    * TODO: auto unsubscription


   * Löscht alle Rezepte und Mahlzeiten eines Lagers
   *
   * TODO: besser als Cloud-Funktion damit fehlerhafte Zustände
   * in der Datenbank vermieden werden könne.
   *
   * @param campId
   *
   */
  public deleteAllMealsAndRecipes(campId: string) {

    this.db.collectionGroup('specificMeals', this.createQuery(['used_in_camp', '==', campId])).get()
      .subscribe(mealsRefs => mealsRefs.docs.forEach(docRef => docRef.ref.delete()));

    this.db.collectionGroup('specificRecipes', this.createQuery(['used_in_camp', '==', campId])).get()
      .subscribe(mealsRefs => mealsRefs.docs.forEach(docRef => docRef.ref.delete()));

  }

  /**
   *   * TODO: auto unsubscription

   * @param obj
   */
  public deleteDocument(obj: FirestoreObject) {

    return this.db.doc(obj.path).delete();

  }

  /**   * TODO: auto unsubscription

   *
   * @param path
   */
  public requestDocument(path: string): Observable<Action<DocumentSnapshot<unknown>>> {

    return this.db.doc(path).snapshotChanges();

  }

  /**
   *   * TODO: auto unsubscription

   * @param path
   * @param queryFn
   */
  public requestCollection(path: string, queryFn?: QueryFn): Observable<DocumentChangeAction<unknown>[]> {

    return this.db.collection(path, queryFn).snapshotChanges();

  }

  /**
   *   * TODO: auto unsubscription

   * @param mealId
   */
  public getNumberOfUses(mealId: string): Observable<number> {

    return this.db.collectionGroup('specificMeals', this.createQuery(['meal_id', '==', mealId])).get()
      .pipe(map(refs => refs.docs.length));

  }

  /**
   *   * TODO: auto unsubscription

   * TODO: besser als Cloud-Funktion damit fehlerhafte Zustände
   * in der Datenbank vermieden werden könne.
   *
   * @param mealId
   */
  public deleteRecipesRefs(mealId: string) {
    this.createAccessQueryFn(['editor', 'owner', 'collaborator', 'viewer'], ['used_in_meals', 'array-contains', mealId]).pipe(mergeMap(query =>
      this.db.collection('recipes', query).get()))
      .pipe(take(1))
      .subscribe(docRefs => docRefs.docs.forEach(doc =>
        doc.ref.update({used_in_meals: FieldValue.arrayRemove(mealId)})
      ));

  }

  /**
   *   * TODO: auto unsubscription

   * @param firebaseObject
   */
  public async canWrite(firebaseObject: FirestoreObject): Promise<boolean> {

    return new Promise(resolve => this.authService.getCurrentUser().subscribe(user =>
      resolve(
        firebaseObject.getAccessData()[user.uid] !== undefined &&  // user isn't listed
        firebaseObject.getAccessData()[user.uid] !== 'viewer' // if user is listed, user isn't a viewer
      )
    ));

  }

  /**
   *   * TODO: auto unsubscription

   * @param firebaseObject
   */
  public isOwner(firebaseObject: FirestoreObject): Promise<boolean> {

    return new Promise(resolve => this.authService.getCurrentUser().subscribe(user =>
      resolve(firebaseObject.getAccessData()[user.uid] === 'owner')
    ));

  }

  /**
   *   * TODO: auto unsubscription

   * Loads the ingredients of an overwriting of a recipe
   *
   * @param recipeId id of the recipe
   * @param overwriteId documentId of the overwriting
   *
   */
  public loadRecipeOverwrites(recipeId: string, overwriteId: string) {

    return this.db.doc('recipes/' + recipeId + '/overwrites/' + overwriteId).get();

  }

  /**
   *
   *    * TODO: auto unsubscription

   * Saves the overwriting of a recipe
   *
   * @param ingredients overwriting of to be saved
   * @param recipeId id of the recipe
   * @param writer documentId of the overwriting
   */
  async saveOverwrites(ingredients: Ingredient[], recipeId: string, writer: string) {

    await this.db.doc('recipes/' + recipeId + '/overwrites/' + writer)
      .update({
        ingredients
      });

  }


  // *********************************************************************************************
  // private methods
  //
  // TODO: Alle query functions in eine eigene Klasse auslagern
  //
  // *********************************************************************************************

  public updateSettings(settings: FirestoreSettings) {

    return new Promise(resolve =>
      this.authService.getCurrentUser().subscribe(user =>
        this.db.doc('users/' + user.uid + '/private/settings').set(settings).then(resolve)));

  }

  getPreparedMeals(documentId: string) {

    return this.db.collectionGroup('specificMeals', query => query
      .where('meal_gets_prepared', '==', true)
      .where('used_in_camp', '==', documentId))
      .snapshotChanges()
      .pipe(FirestoreObject.createObjects<FirestoreSpecificMeal, SpecificMeal>(SpecificMeal));

  }

  legacyPDFCreation(campId) {
    return this.functions.httpsCallable('createPDF')({campId});
  }

  /**
   *
   * TODO: add description
   * @param autoUnsubscription
   *
   */
  private doAutoUnsubscription<T>(autoUnsubscription: boolean): OperatorFunction<T, T> {

    return mergeMap(object =>
      autoUnsubscription ? of(object).pipe(takeUntil(this.routerChanges)) : of(object));

  }

  /**
   *
   * @param recipe
   * @param specificMealId
   * @param camp
   */
  private loadSpecificRecipe(recipe: Recipe, mealId: string, specificMealId: string, camp: Camp) {

    return this.requestDocument('recipes/' + recipe.documentId + '/specificRecipes/' + specificMealId)

      // nicht die schönste Lösung, um die spezifischen Rezepte
      // dynamisch zu erzeugen, falls diese nicht existieren.
      .pipe(mergeMap(ref => {

        if (ref.payload.exists) {
          return of(ref);
        }

        recipe.createSpecificRecipe(camp, recipe.documentId, mealId, specificMealId, this);
        return this.loadSpecificRecipe(recipe, specificMealId, mealId, camp);

      }));
  }

  /** creates a query function for access restriction (using the currentUser) */
  private createAccessQueryFn(accessRights: string[], ...queries: [string | FieldPath, WhereFilterOp, any][]): Observable<QueryFn> {

    return this.authService.getCurrentUser().pipe(map(user =>

      (collRef => {

        let query = collRef.where('access.' + user.uid, 'in', accessRights);
        query = this.createQueryFn(query, ...queries);
        return query;

      })
    ));

  }

  private createQuery(...queries: [string | FieldPath, WhereFilterOp, any][]): QueryFn {

    return (collRef => {

      return this.createQueryFn(collRef, ...queries);

    });

  }

  private createQueryFn(query: Query, ...queries: [string | FieldPath, WhereFilterOp, any][]) {

    queries.forEach(queryCond => {
      query = query.where(queryCond[0], queryCond[1], queryCond[2]);
    });

    return query;
  }

  private getPathsToCloudDocuments(): OperatorFunction<DocumentChangeAction<ExportDocData>[], ExportData[]> {

    return mergeMap(docChangeAction =>
      forkJoin(docChangeAction.map(docData => {

          const exportDocData = docData.payload.doc.data();

          const pathsObservables: Observable<string[]> = forkJoin(exportDocData.docs.map(docType =>
            this.cloud.ref(exportDocData.path + '.' + docType).getDownloadURL() as Observable<string>
          ));

          return pathsObservables.pipe(map(paths => ({exportDate: exportDocData.exportDate, paths})));

        }
      ))
    );
  }

  linkOrCopyRecipes(oldMealId: any, newMealId: string) {

    this.getRecipes(oldMealId)
      .pipe(take(1))
      .subscribe(recipes => recipes.forEach(recipe => {

        this.createAccessQueryFn(['editor', 'owner', 'collaborator', 'viewer'],
          ['created_from_template', '==', recipe.documentId])
          .pipe(mergeMap(queryFn => this.db.collection('recipes', queryFn).get()))
          .subscribe(docs => {
            console.log(docs.docs)
            if (docs.docs.length > 0) {
              docs.docs[0].ref.update({used_in_meals: FieldValue.arrayUnion(newMealId)});
            } else {
              this.createCopy(recipe, newMealId);
            }
          });

      }));

  }


  getFeedbackMessages() {
    return this.db.collection('/sharedData/feedback/messages',
      ref => ref.orderBy('date_added', 'desc')).snapshotChanges();
  }

  resolve_issue(docID: string) {
    return this.db.doc('/sharedData/feedback/messages/' + docID).delete();
  }

  getUncategorizedFood() {
    return this.db.doc('/sharedData/foodCategories').get().pipe(map(doc => doc.data()['uncategorised']));
  }

  getResentCorrections() {
    return this.db.doc('/sharedData/foodCategories').get().pipe(map(doc => doc.data()['resentCorrections']));
  }
}


interface ExportDocData {
  path: string;
  docs: string[];
  exportDate: any;
}

interface ExportData {
  paths: string[];
  exportDate: any;
}



