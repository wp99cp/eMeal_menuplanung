import { FirebaseObject } from "./firebaseObject";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from 'rxjs';
import { Recipe } from './recipe';
import { AccessData } from '../_interfaces/accessData';
import { FirestoreMeal } from '../_interfaces/firestore-meal';



/** Angular representation of a 'FirestoreMeal' */
export class Meal extends FirebaseObject implements FirestoreMeal {

    public static readonly FIRESTORE_DB_PATH = 'meals/';

    public readonly firestoreElementId: string;
    protected readonly FIRESTORE_DB_PATH = Meal.FIRESTORE_DB_PATH;

    public title: string;
    public desciption: string;
    public access: AccessData;

    private recipes: Observable<Recipe[]> = null;


    constructor(data: FirestoreMeal, db: AngularFirestore) {

        super(db);
        this.title = data.title;
        this.desciption = data.desciption;
        this.firestoreElementId = data.firestoreElementId;
        this.access = data.access;

    }

    public extractDataToJSON(): FirestoreMeal {

        return {
            title: this.title,
            desciption: this.desciption,
            access: this.access,
            firestoreElementId: this.firestoreElementId
        };
    }

    public getRecipes(): Observable<Recipe[]> {

        if (this.recipes != null) {
            return this.recipes;
        }
        else {

            // loadRecipes

            return new Observable<Recipe[]>();
        }
    }

}