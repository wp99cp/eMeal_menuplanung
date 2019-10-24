import { FirebaseObject } from "./firebaseObject";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable, Observer } from 'rxjs';
import { Recipe } from './recipe';
import { AccessData } from '../_interfaces/accessData';
import { FirestoreMeal } from '../_interfaces/firestore-meal';
import { map } from 'rxjs/operators'
import { FirestoreRecipe } from '../_interfaces/firestore-recipe';
import { SpecificMeal } from './specific-meal';


/** Angular representation of a 'FirestoreMeal' */
export class Meal extends FirebaseObject implements FirestoreMeal {

    public static readonly FIRESTORE_DB_PATH = 'meals/';

    public readonly firestoreElementId: string;
    protected readonly FIRESTORE_DB_PATH = Meal.FIRESTORE_DB_PATH;

    public title: string;
    public description: string;
    public access: AccessData;

    public specificMeal: Observable<SpecificMeal>;

    private recipes: Observable<Recipe[]> = null;


    constructor(data: FirestoreMeal, firestoreElementId: string, db: AngularFirestore, private relatedCampId: string = null) {

        super(db);
        this.title = data.title;
        this.description = data.description;
        this.firestoreElementId = firestoreElementId;
        this.access = data.access;

        if (relatedCampId != null) {
            this.loadSpecificMeal();
        }

    }

    /** loads the specific Meal data */
    private loadSpecificMeal() {

        this.specificMeal = Observable.create((observer: Observer<SpecificMeal>) => {

            this.FIRESTORE_DATABASE
                .collection('meals/' + this.firestoreElementId + '/specificMeals',
                    collRef => collRef.where('campId', "==", this.relatedCampId).limit(1)).get()
                .subscribe(specificMeal => {
                    let path = 'meals/' + this.firestoreElementId + '/specificMeals/' + specificMeal.docs[0].id;
                    observer.next(new SpecificMeal(specificMeal.docs[0].data() as SpecificMeal, path, this.FIRESTORE_DATABASE));
                });
        });


    }

    public extractDataToJSON(): FirestoreMeal {

        let firestoreMeal = {
            title: this.title,
            description: this.description,
            access: this.access,
            firestoreElementId: this.firestoreElementId
        };

        // Meals generated out of a day don't contain access and description properties
        // They are removed if they're undefinded...
        if (firestoreMeal.access == undefined) delete firestoreMeal.access;
        if (firestoreMeal.description == undefined) delete firestoreMeal.description;

        return firestoreMeal;

    }

    public getRecipes(): Observable<Recipe[]> {


        if (this.recipes != null) {

            return this.recipes;
        }
        else {

            // loadRecipes
            this.recipes = Observable.create((observer: Observer<Recipe[]>) => {

                this.FIRESTORE_DATABASE.collection('meals/' + this.firestoreElementId + '/recipes',
                    collRef => collRef.where('access.owner', "array-contains", "ZmXlaYpCPWOLlxhIs4z5CMd27Rn2"))
                    .snapshotChanges()

                    // Create new Meals out of the data
                    .pipe(map(docActions =>
                        docActions.map(
                            docAction => new Recipe(docAction.payload.doc.data() as FirestoreRecipe, docAction.payload.doc.id, this.firestoreElementId, this.FIRESTORE_DATABASE, this.relatedCampId)
                        ))
                    )
                    .subscribe(recipes => observer.next(recipes));

            });


            return this.recipes;
        }
    }

}