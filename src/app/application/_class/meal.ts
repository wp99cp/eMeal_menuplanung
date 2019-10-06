import { FirebasePush } from "./firebasePush";
import { AngularFirestore } from "@angular/fire/firestore";

export class Meal extends FirebasePush {

    public title: string;

    constructor(data: unknown, public readonly FIRESTORE_ELEMENT_ID: string, db: AngularFirestore) {

        super(db);

        this.title = data["title"];

    }


    protected FIRESTORE_DB_PATH: string;
    protected extractDataToJSON(): Partial<unknown> {
        throw new Error("Method not implemented.");
    }
}
