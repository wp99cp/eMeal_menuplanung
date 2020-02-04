import { FirestoreObject, ExportableObject } from './firebaseObject';
import { FirestoreUser, UserVisibily } from '../_interfaces/firestoreDatatypes';

export class User extends FirestoreObject implements ExportableObject {

  public readonly path: string;
  public readonly documentId: string;

  public displayName: string;
  public visibility: UserVisibily;
  public readonly uid: string;
  public readonly email: string;

  constructor(user: FirestoreUser, path: string) {

    super(user);

    this.path = path;
    this.documentId = path.substring(path.lastIndexOf('/') + 1);

    this.uid = this.documentId;
    this.displayName = user.displayName;
    this.email = user.email;
    this.visibility = user.visibility;

  }

  public toFirestoreDocument(): FirestoreUser {

    const user = super.toFirestoreDocument() as FirestoreUser;

    user.email = this.email;
    user.displayName = this.displayName;
    user.visibility = this.visibility;

    return user;

  }

}
