import { FirebasePush } from './firebasePush';
import { AngularFirestore } from '@angular/fire/firestore';
import { Day } from './day';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'
import { Observer } from 'firebase';

/**
 * 
 */
export class Camp extends FirebasePush {

    public static readonly CAMPS_DIRECTORY = "camps/";
    protected readonly FIRESTORE_DB_PATH = Camp.CAMPS_DIRECTORY;

    // fields of a camp
    public name: string;
    public description: string;
    public participants: number;
    public year: string;

    private days: Observable<[Day]>;

    constructor(data: unknown, public readonly FIRESTORE_ELEMENT_ID: string, database: AngularFirestore) {

        super(database);

        this.description = data["description"];
        this.name = data["name"];
        this.participants = data["participants"];
        this.year = data["year"];

    }

    protected extractDataToJSON(): Partial<unknown> {

        return {
            name: this.name,
            description: this.description,
            year: this.year,
            participants: this.participants
        };

    }

    /**
     * 
     */
    public getDays(): Observable<[Day]> {

        // The days get loaded by the first usage
        if (this.days == undefined)
            this.loadDays();

        return this.days;

    }

    /**
     * 
     */
    private loadDays() {

        this.days = Observable.create((observer: Observer<Day[]>) => {

            // TODO: dynamic uid
            this.FIRESTORE_DATABASE.collection(this.FIRESTORE_DB_PATH + this.FIRESTORE_ELEMENT_ID + Day.DAYS_DIRECTORY,
                collRef => collRef.where('access.owner', "array-contains", "ZmXlaYpCPWOLlxhIs4z5CMd27Rn2"))
                .snapshotChanges()
                .pipe(
                    map((docRefs) =>
                        docRefs.map((docRef) =>
                            new Day(docRef.payload.doc.data(), docRef.payload.doc.id, this.FIRESTORE_DATABASE)))
                )
                .subscribe(days => observer.next(days));
        });

    }

}
