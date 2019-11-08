import { AngularFirestore } from '@angular/fire/firestore';
import { FirestoreSpecificMeal } from '../_interfaces/firestore-specific-meal-data';
import { FirebaseObject } from './firebaseObject';

export class SpecificMeal extends FirebaseObject implements FirestoreSpecificMeal {

    public campId: string;
    public participants: number;

    protected firestorePath: string;
    public firestoreElementId: string;

    constructor(firestoreSpecificMeal: FirestoreSpecificMeal, path: string) {

        super();

        this.firestorePath = path.substring(0, path.lastIndexOf('/'));
        this.firestoreElementId = path.substring(path.lastIndexOf('/'));

        this.participants = firestoreSpecificMeal.participants;
        this.campId = firestoreSpecificMeal.campId;


    }

    public extractDataToJSON(): FirestoreSpecificMeal {

        return {
            participants: this.participants,
            campId: this.campId
        };

    }


}
