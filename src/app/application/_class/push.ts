import { AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { subscribeOn } from 'rxjs/operators';

export abstract class Push {

    protected readonly abstract PATH: string;
    protected readonly abstract id: string;


    constructor(private db: AngularFirestore) { }

    /**
     * 
     * extracts the data form the fields of the database
     * used for updating the document in the database
     * 
     */
    protected abstract extractData(): Partial<unknown>;

    /**
     * updates the referd document in the databse
     * 
     */
    public push() {

        this.db.doc(this.PATH + this.id).update(this.extractData());

    }

}
