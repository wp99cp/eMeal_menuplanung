import { FirestoreDocument, AccessData } from '../_interfaces/firestoreDatatypes';
import { firestore } from 'firebase';
import { OperatorFunction } from 'rxjs';
import { DocumentChangeAction, DocumentSnapshot, Action } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { isDevMode } from '@angular/core';

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


  private access: AccessData;
  private readonly dateAdded: firestore.Timestamp;

  public lastChange: Date;

  /**
   *
   * @param objecType Type of the created Object
   *
   */
  public static createObjects<DocType extends FirestoreDocument, ObjecType extends FirestoreObject>
    (objecType: ObjectFactory<DocType, ObjecType>): OpFnObjects<DocType, ObjecType> {

    if (isDevMode()) {
      console.log('createObjects: ' + objecType.name + '[]');
    }

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

    if (isDevMode()) {
      console.log('createObject: ' + objecType.name);
    }

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
      date_modified: firestore.FieldValue.serverTimestamp(),
      date_added: firestore.FieldValue.serverTimestamp(),
      access: { [ownerUid]: 'owner' }
    };

  }

  /**
   * creates a new FirestoreObject from a FirestoreDocument
   *
   */
  constructor(document: FirestoreDocument) {

    if (document === undefined) {
      throw new Error('Invalid firestore document!');
    }

    this.lastChange = document.date_modified !== null ? (document.date_modified as firestore.Timestamp).toDate() : new Date();

    this.dateAdded = document.date_added as firestore.Timestamp;
    this.access = document.access;

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

    // TODO: add checks for errors

    this.access = access;

  }


  /**
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
      date_modified: firestore.FieldValue.serverTimestamp(),
      date_added: this.dateAdded,
      access: this.access
    };

  }

}
