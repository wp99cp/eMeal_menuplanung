import {AccessData, FirestoreDocument} from '../interfaces/firestoreDatatypes';
import {OperatorFunction} from 'rxjs';
import {Action, DocumentChangeAction, DocumentSnapshot} from '@angular/fire/compat/firestore';
import {map} from 'rxjs/operators';
import firebase from "firebase/compat/app";
import FieldValue = firebase.firestore.FieldValue;
import Timestamp = firebase.firestore.Timestamp;

export interface ExportableObject {

  /**
   * Exportes the FirestoreObject as a FirestoreDocument.
   *
   */
  toFirestoreDocument(): FirestoreDocument;

}


type ObjectFactory<DocType extends FirestoreDocument, ObjecType extends FirestoreObject> =
  (new (document: DocType, documentId: string) => ObjecType);

type OpFnObjects<DocType extends FirestoreDocument, ObjecType extends FirestoreObject> =
  OperatorFunction<DocumentChangeAction<DocType>[], ObjecType[]>;

type OpFnObject<DocType extends FirestoreDocument, ObjecType extends FirestoreObject> =
  OperatorFunction<Action<DocumentSnapshot<DocType>>, ObjecType>;

/**
 * FirestoreObject is the Object representation of a FirestoreDocument
 */
export abstract class FirestoreObject implements ExportableObject {

  public readonly abstract path: string;
  public readonly abstract documentId: string;
  public lastChange: Date;
  private access: AccessData;
  private readonly dateAdded: Timestamp;

  /**
   * creates a new FirestoreObject from a FirestoreDocument
   *
   */
  protected constructor(document: FirestoreDocument) {

    if (document === undefined) {
      throw new Error('Invalid firestore document!');
    }

    this.lastChange = document.date_modified !== null ? (document.date_modified as Timestamp).toDate() : new Date();

    this.dateAdded = document.date_added as Timestamp;
    this.access = document.access;

  }

  /**
   *
   * @param objecType Type of the created Object
   *
   */
  public static createObjects<DocType extends FirestoreDocument, ObjecType extends FirestoreObject>
  (objecType: ObjectFactory<DocType, ObjecType>): OpFnObjects<DocType, ObjecType> {

    return map(docChangeAction =>
      docChangeAction.map(docData =>
        new objecType(docData.payload.doc.data() as DocType, docData.payload.doc.ref.path)
      )
    );

  }

  /**
   *
   * @param objecType Type of the created Object
   */
  public static createObject<DocType extends FirestoreDocument, ObjecType extends FirestoreObject>
  (objecType: ObjectFactory<DocType, ObjecType>): OpFnObject<DocType, ObjecType> {

    return map(docSnapshot =>
      new objecType(docSnapshot.payload.data(), docSnapshot.payload.ref.path)
    );

  }

  /**
   * creates an empty FirestoreDocument for a given userId
   * @parms the userId from the user which is the owner of this document
   *
   */
  public static exportEmptyDocument(ownerUid: string): FirestoreDocument {

    return {
      date_modified: FieldValue.serverTimestamp(),
      date_added: FieldValue.serverTimestamp(),
      access: {[ownerUid]: 'owner'}
    };

  }

  /**
   * Sets a new accessData for the FirestoreObject.
   *
   * @throws a IllegalAccessStateError if the document has no owner
   * @throws a AccessPermisionError if the current user isn't
   * a owner or editor of the docuemnt.
   *
   */
  public setAccessData(access: AccessData): void {

    // und prüft auf erlaubte Veränderungen...
    this.access = access;

  }

  /**
   *
   * Returns the accessData of the FirestoreObject
   *
   * @returns the accessData of the FirestoreObject
   *
   */
  public getAccessData(): AccessData {

    return this.access;

  }

  public toFirestoreDocument(): FirestoreDocument {

    return {
      date_modified: FieldValue.serverTimestamp(),
      date_added: this.dateAdded,
      access: this.access
    };

  }

}
