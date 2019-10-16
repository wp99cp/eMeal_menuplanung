import { FirebaseObject } from './firebaseObject';
import { Meal } from './meal';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, Observer } from 'rxjs';
import { map } from 'rxjs/operators'
import { Camp } from './camp';

export class Day {

    public date: Date;
    public name: string;

    private relatedCamp: Camp;
    private meals: Observable<[Meal]>;

    constructor(data: unknown, camp: Camp) {

        let date: firebase.firestore.Timestamp = data["date"];
        this.date = date.toDate();
        this.relatedCamp = camp;
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


    }

}
