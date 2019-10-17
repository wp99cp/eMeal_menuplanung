import { AngularFirestore } from '@angular/fire/firestore';

/**
 * Add's the ability to push changes of a child object to the FirebaseServer
 */
export abstract class FirebaseObject {

    /** Path in the firestore databse to the collection of this object 
     *  (Note the path mus end with '/', e.g. 'camps/campId/days/')
    */
    protected readonly abstract FIRESTORE_DB_PATH: string;

    /** The firestore database element id */
    protected readonly abstract FIRESTORE_ELEMENT_ID: string;

    /**
     * 
     * Extracts the data form the fields of the database
     * used for updating the document in the database.
     * 
     */
    protected abstract extractDataToJSON(): Partial<unknown>;


    constructor(public readonly FIRESTORE_DATABASE: AngularFirestore) { }

    /**
     * updates the referd document in the databse
     * 
     */
    public pushToFirestoreDB() {

        let docPath = this.FIRESTORE_DB_PATH + this.FIRESTORE_ELEMENT_ID;
        this.FIRESTORE_DATABASE.doc(docPath)
            .update(this.extractDataToJSON());

    }

    /**
     * Deletes a document in the firestore database
     */
    public deleteOnFirestoreDB() {

        let docPath = this.FIRESTORE_DB_PATH + this.FIRESTORE_ELEMENT_ID;
        this.FIRESTORE_DATABASE.doc(docPath).delete();

    }

}
