import { FirebaseObject } from './firebaseObject';
import { FirestoreSpecificMeal } from '../_interfaces/firestore-specific-meal-data';
import { AngularFirestore } from '@angular/fire/firestore';

export class SpecificMeal extends FirebaseObject implements FirestoreSpecificMeal {

    public campId: string;

    public participants: number;

    protected FIRESTORE_DB_PATH: string;
    public firestoreElementId: string;

    constructor(firestoreSpecificMeal: FirestoreSpecificMeal, path: string, db: AngularFirestore) {

        super(db);

        this.FIRESTORE_DB_PATH = path.substring(0, path.lastIndexOf('/'));
        this.firestoreElementId = path.substring(path.lastIndexOf('/'));

        this.participants = firestoreSpecificMeal.participants;

    }

    protected extractDataToJSON(): FirestoreSpecificMeal {

        return {
            participants: this.participants,
            campId: this.campId
        }

    }


}
