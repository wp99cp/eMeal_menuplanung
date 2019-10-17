import { Camp } from './camp';

export class Day {


    public date: Date;
    public description: string;

    private relatedCamp: Camp;
    // private meals: Observable<[Meal]>;

    public meals;

    constructor(data: unknown, camp: Camp) {

        let date: firebase.firestore.Timestamp = data["date"];
        this.date = date.toDate();
        if (data['description'] != undefined) {
            this.description = data['description'];
        }
        else {
            this.description = '';
        }
        this.relatedCamp = camp;

        this.meals = data['meals'];
    }

    extractDataToJSON(): Partial<unknown> {
        return {
            date: this.date,
            description: this.description,
            meals: this.meals

        };
    }

    /** 
    public getMeals(): Observable<[Meal]> {

        // The days get loaded by the first usage
        if (this.meals == undefined)
            this.loadMeals();

        return this.meals;

    }
*/

    public getDateStr(): String {
        return this.date.toLocaleDateString('de-CH', { "weekday": "long", "month": "short", "day": "2-digit" });
    }
    public getDiscriptionInBracket(): String {
        if (this.description != '')
            return '(' + this.description + ')';

        return '';
    }

    /**
     * 
     */
    private loadMeals() {


    }

}
