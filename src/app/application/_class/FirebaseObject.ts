import { DatabaseService } from '../_service/database.service';

/**
 * Add's the ability to push changes of a child object to the FirebaseServer
 */
export abstract class FirebaseObject {

    /** current user */
    protected static user: firebase.User;

    /** Path in the firestore databse to the collection of this object 
         *  (Note the path mus end with '/', e.g. 'camps/campId/days/')
        */
    protected readonly abstract firestorePath: string;

    /** The firestore database element id */
    protected readonly abstract firestoreElementId;

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

    public getCollection(): string {

        return this.firestorePath;

    }

}
