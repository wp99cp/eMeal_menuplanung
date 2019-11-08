import { AngularFirestore } from '@angular/fire/firestore';
import { FirestoreSpecificRecipe } from '../_interfaces/firestore-specific-recipe';
import { FirebaseObject } from './firebaseObject';

export class SpecificRecipe extends FirebaseObject implements FirestoreSpecificRecipe {

    public campId: string;

    public participants: number;

    protected firestorePath: string;
    protected firestoreElementId: string;


    constructor(firestoreSpecificRecipes: FirestoreSpecificRecipe, path: string) {

        super();

        this.firestorePath = path.substring(0, path.lastIndexOf('/'));
        this.firestoreElementId = path.substring(path.lastIndexOf('/'));

        this.participants = firestoreSpecificRecipes.participants;
    }

    public extractDataToJSON(): FirestoreSpecificRecipe {

        return {
            participants: this.participants,
            campId: this.campId
        };

    }


}
