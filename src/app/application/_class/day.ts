import { FirebasePush } from './firebasePush';
import { Meal } from './meal';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'

export class Day extends FirebasePush {

    protected readonly FIRESTORE_DB_PATH = "camps/.../days/";
    protected dayId: string;

    public date: Date;
    public name: string;

    private meals: Observable<[Meal]>;

    constructor(data: unknown, public readonly FIRESTORE_ELEMENT_ID: string, db: AngularFirestore) {

        super(db);

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

    /**
     * 
     */
    private loadMeals() {

        this.meals = Observable.create(observer => {

            // TODO: uid and where for current day...
            this.FIRESTORE_DATABASE.collection('meals/', collRef => collRef.where('access.owner', "array-contains", "ZmXlaYpCPWOLlxhIs4z5CMd27Rn2")).snapshotChanges()
                .pipe(
                    map(docActions => docActions.map(docAction => new Meal(docAction.payload.doc.data(), docAction.payload.doc.id, this.FIRESTORE_DATABASE)))
                )
                .subscribe(camps => observer.next(camps));
        });

    }

}
