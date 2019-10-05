import { Push } from './push';
import { Meal } from './meal';

export class Day extends Push {

    protected readonly PATH = "camps/.../days/";
    protected id: string;

    public date: Date;


    private meals: [Meal];

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
