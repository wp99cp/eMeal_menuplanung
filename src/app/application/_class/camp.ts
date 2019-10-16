import { FirebaseObject } from './firebaseObject';
import { AngularFirestore } from '@angular/fire/firestore';
import { Day } from './day';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'
import { Observer } from 'firebase';
import { firestore } from 'firebase';
import { AuthenticationService } from '../_service/authentication.service';


/**
 * 
 */
export class Camp extends FirebaseObject {

    /**
     * 
     * creates a new Camp in the database
     * 
     * @param data as JSON
     * @param database firestore database
     * @param auth AuthenticationService
     */
    static createNewCamp(data: any, coworkers: any, database: AngularFirestore, auth: AuthenticationService) {

        auth.fireAuth.authState.subscribe((user: firebase.User) => {

            let date = new Date(data['date']);
            delete data['date'];

            // set year of the camp
            data['year'] = date.toLocaleDateString('de-CH', { year: 'numeric' });

            // create first day
            data['days'] = [{
                date: firestore.Timestamp.fromDate(date),
                meals: [],
                participants: data['participants'],
                overwriteParticipants: false
            }];

            // create access tag
            data['access'] = { owner: [user.uid], editor: Camp.generateCoworkersList(user.uid, coworkers) };

            // write to database
            database.collection(this.CAMPS_DIRECTORY).add(data);

        });

    }

    /**
     * 
     * @param ownerUid 
     * @param coworkers 
     */
    static generateCoworkersList(ownerUid: String, coworkers: any): String[] {

        let uidList: String[] = [];

        if (coworkers != undefined) {
            coworkers.forEach(coworker => {
                let uid: String = coworker['uid'];
                if (ownerUid != uid)
                    uidList.push(uid);
            });
        }

        return uidList;

    }

    public static readonly CAMPS_DIRECTORY = "camps/";
    protected readonly FIRESTORE_DB_PATH = Camp.CAMPS_DIRECTORY;

    // fields of a camp
    public name: string;
    public description: string;
    public participants: number;
    public year: string;

    public days: Day[] = [];

    constructor(data: unknown, public readonly FIRESTORE_ELEMENT_ID: string, database: AngularFirestore) {

        super(database);

        this.description = data["description"];
        this.name = data["name"];
        this.participants = data["participants"];
        this.year = data["year"];

        if (data['days']) {
            for (let dayData of data['days']) {
                this.days.push(new Day(dayData, this));
            }
        }

    }

    // doc on mother class 
    protected extractDataToJSON(): Partial<unknown> {

        return {
            name: this.name,
            description: this.description,
            year: this.year,
            participants: this.participants
        };

    }

}
