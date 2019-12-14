import { AngularFirestore } from '@angular/fire/firestore';
import { FirebaseObject } from './firebaseObject';
import { FirestoreSpecificRecipe } from '../_interfaces/firestore-specific-recipe';

export class SpecificRecipe extends FirebaseObject implements FirestoreSpecificRecipe {

  public campId: string;

  public participants: number;
  public overrideParticipants = false;
  protected firestorePath: string;
  protected firestoreElementId: string;


  constructor(data: FirestoreSpecificRecipe, path: string) {

    super();

    this.firestorePath = path.substring(0, path.lastIndexOf('/'));
    this.firestoreElementId = path.substring(path.lastIndexOf('/'));

    this.participants = data.participants;
    this.campId = data.campId;

    if (data.overrideParticipants !== undefined) {
      this.overrideParticipants = data.overrideParticipants;
    }

  }

  public extractDataToJSON(): FirestoreSpecificRecipe {

    return {
      participants: this.participants,
      campId: this.campId,
      overrideParticipants: this.overrideParticipants
    };

  }


}
