import { Push } from './push';
import { Meal } from './meal';
import { AngularFirestore } from '@angular/fire/firestore';

export class Day extends Push {

    protected readonly PATH = "camps/.../days/";
    protected dayId: string;

    public date: Date;
    public name: string;


    private meals: [Meal];

    constructor(data: unknown, public readonly id: string, db: AngularFirestore) {

        super(db);

        this.dayId = id;
        this.date = data["date"];

    }

    protected extractData(): Partial<unknown> {

        // json Data
        return {

            date: this.date

        };

    }

    public getMeals(): [Meal] {

        return this.meals;

    }

    public addDay(meal: Meal): void {

        this.meals.push(meal);

    }
}
