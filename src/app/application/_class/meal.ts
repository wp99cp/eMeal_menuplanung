import { FirebaseObject } from "./firebaseObject";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable, Observer } from 'rxjs';
import { Recipe } from './recipe';
import { AccessData } from '../_interfaces/accessData';
import { FirestoreMeal } from '../_interfaces/firestore-meal';
import { map } from 'rxjs/operators'
import { FirestoreRecipe } from '../_interfaces/firestore-recipe';



/** Angular representation of a 'FirestoreMeal' */
export class Meal extends FirebaseObject implements FirestoreMeal {

    public static readonly FIRESTORE_DB_PATH = 'meals/';

    public readonly firestoreElementId: string;
    protected readonly FIRESTORE_DB_PATH = Meal.FIRESTORE_DB_PATH;

    public title: string;
    public desciption: string;
    public access: AccessData;

    private recipes: Observable<Recipe[]> = null;


    constructor(data: FirestoreMeal, firestoreElementId: string, db: AngularFirestore) {

        super(db);
        this.title = data.title;
        this.desciption = data.desciption;
        this.firestoreElementId = firestoreElementId;
        this.access = data.access;

    }

    public extractDataToJSON(): FirestoreMeal {
        return this;
    }

    public getRecipes(): Observable<Recipe[]> {


        if (this.recipes != null) {

            return this.recipes;
        }
        else {

            // loadRecipes
            this.recipes = Observable.create((observer: Observer<Recipe[]>) => {

                console.log('meals/' + this.firestoreElementId + '/recipes')
                this.FIRESTORE_DATABASE.collection('meals/' + this.firestoreElementId + '/recipes',
                    collRef => collRef.where('access.owner', "array-contains", "ZmXlaYpCPWOLlxhIs4z5CMd27Rn2")).snapshotChanges()

                    // Create new Meals out of the data
                    .pipe(map(docActions =>
                        docActions.map(docAction => {
                            let recipeData: FirestoreRecipe = docAction.payload.doc.data() as FirestoreRecipe;

                            console.log('hier')
                            console.log(recipeData)

                            return new Recipe(recipeData, docAction.payload.doc.id, this.FIRESTORE_DATABASE);
                        }
                        ))
                    )
                    .subscribe(recipes => observer.next(recipes));

            });


            return this.recipes;
        }
    }

}