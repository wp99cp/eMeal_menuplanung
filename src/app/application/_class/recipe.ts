import { AccessData } from '../_interfaces/accessData';
import { Ingredient } from '../_interfaces/ingredient';
import { FirestoreRecipe } from '../_interfaces/firestore-recipe';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirebaseObject } from './firebaseObject';
import { Meal } from './meal';

export class Recipe extends FirebaseObject implements FirestoreRecipe {

    protected FIRESTORE_DB_PATH: string;
    protected firestoreElementId: any;

    public access: AccessData;
    public ingredients: Ingredient[];
    public name: string;
    public description: string;

    constructor(recipeData: FirestoreRecipe, firestoreElementId: string, database: AngularFirestore) {
        super(database);

        this.FIRESTORE_DB_PATH = Meal.FIRESTORE_DB_PATH + firestoreElementId + '/recipes/';
        this.firestoreElementId = firestoreElementId;

        this.access = recipeData.access;
        this.ingredients = recipeData.ingredients;
        this.name = recipeData.name;
        this.description = recipeData.description;

    }

    protected extractDataToJSON(): FirestoreRecipe {

        return this;

    }


}


