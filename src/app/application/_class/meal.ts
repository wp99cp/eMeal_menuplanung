import { Push } from "./push";
import { AngularFirestore } from "@angular/fire/firestore";

export class Meal extends Push {

    public title: string;

    constructor(data: unknown, public readonly id: string, db: AngularFirestore) {

        super(db);

        this.title = data["title"];

    }


    protected PATH: string;
    protected extractData(): Partial<unknown> {
        throw new Error("Method not implemented.");
    }
}
