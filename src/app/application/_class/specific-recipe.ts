import { FirebaseObject } from './firebaseObject';
import { FirestoreSpecificRecipe } from '../_interfaces/firestore-specific-recipe';
import { AngularFirestore } from '@angular/fire/firestore';

export class SpecificRecipe extends FirebaseObject implements FirestoreSpecificRecipe {

    public campId: string;

    public participants: number;

    protected FIRESTORE_DB_PATH: string;
    protected firestoreElementId: string;

    constructor(firestoreSpecificRecipes: FirestoreSpecificRecipe, path: string, db: AngularFirestore) {

        super(db);

        this.FIRESTORE_DB_PATH = path.substring(0, path.lastIndexOf('/'));
        this.firestoreElementId = path.substring(path.lastIndexOf('/'));

        this.participants = firestoreSpecificRecipes.participants;

    }

    protected extractDataToJSON(): FirestoreSpecificRecipe {

        return {
            participants: this.participants,
            campId: this.campId
        }

    }


}
