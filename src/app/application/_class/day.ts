import { FirebasePush } from './firebasePush';
import { Meal } from './meal';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, Observer } from 'rxjs';
import { map } from 'rxjs/operators'
import { Camp } from './camp';

export class Day extends FirebasePush {

    public static readonly DAYS_DIRECTORY = "/days/";


    protected readonly FIRESTORE_DB_PATH;
    protected dayId: string;

    public date: Date;
    public name: string;

    private meals: Observable<[Meal]>;

    constructor(data: unknown, public readonly FIRESTORE_ELEMENT_ID: string, db: AngularFirestore) {

        super(db);

        // Set Path to the collection with this data
        this.FIRESTORE_DB_PATH = Camp.CAMPS_DIRECTORY + FIRESTORE_ELEMENT_ID + Day.DAYS_DIRECTORY;

        this.dayId = FIRESTORE_ELEMENT_ID;

        let date: firebase.firestore.Timestamp = data["date"];
        this.date = date.toDate();

    }

    protected extractDataToJSON(): Partial<unknown> {

        // json Data
        return {

            date: this.date

        };

    }

    public getMeals(): Observable<[Meal]> {

        // The days get loaded by the first usage
        if (this.meals == undefined)
            this.loadMeals();

        return this.meals;

    }

    public getDateStr(): String {
        return this.date.toLocaleDateString('de-CH', { "weekday": "long", "month": "short", "day": "2-digit" });
    }

    /**
     * 
     */
    private loadMeals() {

        this.meals = Observable.create((observer: Observer<Meal[]>) => {

            // TODO: uid and where for current day...
            this.FIRESTORE_DATABASE.collection('meals/',
                collRef => collRef

                    // Error: Can not use multiply where array-contains...
                    // New structor for the database needed.
                    .where('access.owner', "array-contains", "ZmXlaYpCPWOLlxhIs4z5CMd27Rn2")
                    .where('days', "array-contains", this.FIRESTORE_ELEMENT_ID))
                .snapshotChanges()
                .pipe(
                    map(docActions => docActions.map(docAction => new Meal(docAction.payload.doc.data(), docAction.payload.doc.id, this.FIRESTORE_DATABASE)))
                )
                .subscribe(meals => observer.next(meals));
        });

    }

}
