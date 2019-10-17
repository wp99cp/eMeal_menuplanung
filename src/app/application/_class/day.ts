import { Camp } from './camp';
import { Meal, MealData } from './meal';
import { firestore } from 'firebase';

export interface DayData {
    date: firestore.Timestamp,
    description: string,
    meals: MealData[],
}

export class Day {

    public date: Date;
    public description: string;
    public meals: Meal[];

    constructor(data: DayData, camp: Camp) {

        let date: firestore.Timestamp = data.date;
        this.date = date.toDate();
        if (data.description != undefined) {
            this.description = data.description;
        }
        else {
            this.description = '';
        }

        this.meals = data.meals.map(mealData => new Meal(mealData, camp.FIRESTORE_DATABASE));
    }

    extractDataToJSON(): DayData {

        return {
            date: firestore.Timestamp.fromDate(this.date),
            description: this.description,
            meals: this.meals.map((meal: Meal) => meal.extractDataToJSON())
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
