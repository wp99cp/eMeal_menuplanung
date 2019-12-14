import { AngularFirestore } from '@angular/fire/firestore';
import { FirestoreSpecificMeal } from '../_interfaces/firestore-specific-meal-data';
import { FirebaseObject } from './firebaseObject';

export class SpecificMeal extends FirebaseObject implements FirestoreSpecificMeal {

  public campId: string;
  public participants: number;
  public weekTitle = '';

  protected firestorePath: string;
  public firestoreElementId: string;

  constructor(data: FirestoreSpecificMeal, path: string) {

    super();

    this.firestorePath = path.substring(0, path.lastIndexOf('/'));
    this.firestoreElementId = path.substring(path.lastIndexOf('/'));

    this.participants = data.participants;
    this.campId = data.campId;

    if (data.weekTitle !== undefined) {
      this.weekTitle = data.weekTitle;
    }

  }

  public extractDataToJSON(): FirestoreSpecificMeal {

    return {
      participants: this.participants,
      campId: this.campId,
      weekTitle: this.weekTitle
    };

  }


}
