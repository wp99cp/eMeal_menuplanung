/**
 * Add's the ability to push changes of a child object to the FirebaseServer
 *
 * TODO: Problem mit object Struktur, im Moment die metheoden get Path doppelt,
 * einmal static und einmal auf das Object bezogen... wie kann ich dieses Problem lösen????
 *
 */
export abstract class FirebaseObject {

  /** Path in the firestore databse to the collection of this object
   *  (Note the path mus end with '/', e.g. 'camps/campId/days/')
   */
  protected readonly abstract firestorePath: string;

  /** The firestore database element id */
  protected readonly abstract firestoreElementId: string;

  /**
   *
   * Extracts the data form the fields of the database
   * used for updating the document in the database.
   *
   */
  public abstract extractDataToJSON(): Partial<unknown>;

  public getDocPath(): string {

    return this.firestorePath + this.firestoreElementId;

  }

  /**
   * Returns the elementId of the element in the firebase database
   */
  public getElemementId(): string {

    return this.firestoreElementId;

  }

  /**
   * Returns the elementId of the element in the firebase database
   *
   */
  public getCollection(): string {

    return this.firestorePath;

  }

}
