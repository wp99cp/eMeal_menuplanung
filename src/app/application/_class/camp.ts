import { Push } from './push';
import { AngularFirestore } from '@angular/fire/firestore';
import { Day } from './day';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'

/**
 * 
 */
export class Camp extends Push {

    protected readonly PATH = "camps/";


    public campId: string;

    public name: any;

    public description: string;
    public participants: number;
    public year: string;

    private days: Observable<[Day]>;

    constructor(data: unknown, public readonly id: string, db: AngularFirestore) {

        super(db);
        this.campId = id;

        this.description = data["description"];
        this.name = data["name"];
        this.participants = data["participants"];
        this.year = data["year"];

    }

    protected extractData(): Partial<unknown> {

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

        this.days = Observable.create(observer => {

            // TODO: uid
            this.db.collection('camps/' + this.campId + '/days', collRef => collRef.where('access.owner', "array-contains", "ZmXlaYpCPWOLlxhIs4z5CMd27Rn2")).snapshotChanges()
                .pipe(
                    map(docActions => docActions.map(docAction => new Day(docAction.payload.doc.data(), docAction.payload.doc.id, this.db)))
                )
                .subscribe(camps => observer.next(camps));
        });

    }

}
