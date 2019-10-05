import { Push } from './push';
import { AngularFirestore } from '@angular/fire/firestore';
import { Day } from './day';


export class Camp extends Push {

    protected readonly PATH = "camps/";

    public description: string;
    public name: string;
    public participants: number;
    public year: string;

    private days: [Day];

    constructor(data: unknown, public readonly id: string, db: AngularFirestore) {

        super(db);

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

    public getDays(): [Day] {

        return this.days;

    }

    public addDay(day: Day): void {

        this.days.push(day);

    }


}
