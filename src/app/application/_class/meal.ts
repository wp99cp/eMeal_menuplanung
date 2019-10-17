import { FirebaseObject } from "./firebaseObject";
import { AngularFirestore } from "@angular/fire/firestore";

export class Meal extends FirebaseObject {

    protected readonly FIRESTORE_ELEMENT_ID: string;
    protected readonly FIRESTORE_DB_PATH = 'meals/';

    public title: string;
    public desciption: string;

    constructor(data: MealData, db: AngularFirestore) {

        super(db);
        this.title = data.title;
        this.desciption = data.desciption;
        this.FIRESTORE_ELEMENT_ID = data.docRef;

    }

    public extractDataToJSON(): MealData {

        return {
            title: this.title,
            desciption: this.desciption,
            docRef: this.FIRESTORE_ELEMENT_ID
        };
    }
}

export interface MealData {
    title: string,
    desciption: string,
    docRef: string
}
