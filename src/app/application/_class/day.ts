import { Camp } from './camp';

export class Day {

    public date: Date;
    public name: string;
    public description: string;

    private relatedCamp: Camp;
    // private meals: Observable<[Meal]>;

    public meals = [{ title: "Zmorgen", text: "normaler Zmorgen" }, { title: "Zmittag", text: "Spätzli" }]

    constructor(data: unknown, camp: Camp) {

        let date: firebase.firestore.Timestamp = data["date"];
        this.date = date.toDate();
        this.description = data['description'];

        this.relatedCamp = camp;
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
        if (this.description != undefined)
            return '(' + this.description + ')';

        return '';
    }

    /**
     * 
     */
    private loadMeals() {


    }

}
