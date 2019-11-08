import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, Observer } from 'rxjs';
import { AccessData } from '../_interfaces/accessData';
import { FirestoreRecipe } from '../_interfaces/firestore-recipe';
import { FirestoreSpecificRecipe } from '../_interfaces/firestore-specific-recipe';
import { Ingredient } from '../_interfaces/ingredient';
import { FirebaseObject } from './firebaseObject';
import { SpecificRecipe } from './specific-recipe';

export class Recipe extends FirebaseObject implements FirestoreRecipe {

    protected firestorePath: string;
    public firestoreElementId: any;

    public access: AccessData;
    public ingredients: Ingredient[];
    public name: string;
    public description: string;
    public notes: string;

    public specificRecipe: Observable<SpecificRecipe>;


    constructor(recipeData: FirestoreRecipe, firestoreElementId: string, mealId: string, specificRecipe: Observable<SpecificRecipe>) {
        super();

        this.firestorePath = 'meals/' + mealId + '/recipes/';
        this.firestoreElementId = firestoreElementId;

        this.access = recipeData.access;
        this.ingredients = recipeData.ingredients;
        this.name = recipeData.name;
        this.description = recipeData.description;
        this.notes = recipeData.notes;

        this.specificRecipe = specificRecipe;

    }

    public extractDataToJSON(): FirestoreRecipe {

        return {
            access: this.access,
            ingredients: this.ingredients,
            name: this.name,
            description: this.description,
            notes: this.notes
        };

    }


}


