import { AccessData } from '../_interfaces/accessData';
import { Ingredient } from '../_interfaces/ingredient';
import { FirestoreRecipe } from '../_interfaces/firestore-recipe';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirebaseObject } from './firebaseObject';
import { Meal } from './meal';
import { SpecificRecipe } from './specific-recipe';
import { Observable, Observer } from 'rxjs';
import { FirestoreSpecificRecipe } from '../_interfaces/firestore-specific-recipe';

export class Recipe extends FirebaseObject implements FirestoreRecipe {

    protected FIRESTORE_DB_PATH: string;
    protected firestoreElementId: any;

    public access: AccessData;
    public ingredients: Ingredient[];
    public name: string;
    public description: string;
    public notes: string;

    public specificRecipe: Observable<SpecificRecipe>;


    constructor(recipeData: FirestoreRecipe, firestoreElementId: string, mealId: string, database: AngularFirestore, private relatedCampId: string = null) {
        super(database);

        this.FIRESTORE_DB_PATH = 'meals/' + mealId + '/recipes/';
        this.firestoreElementId = firestoreElementId;

        this.access = recipeData.access;
        this.ingredients = recipeData.ingredients;
        this.name = recipeData.name;
        this.description = recipeData.description;
        this.notes = recipeData.notes;

        if (relatedCampId != null) {

            this.loadSpecificRecipe();

        }

    }

    private loadSpecificRecipe() {

        this.specificRecipe = Observable.create((observer: Observer<SpecificRecipe>) => {

            this.FIRESTORE_DATABASE
                .collection(this.FIRESTORE_DB_PATH + this.firestoreElementId + '/specificRecipes',
                    collRef => collRef.where('campId', "==", this.relatedCampId).limit(1)).get()
                .subscribe(specificRecipe => {
                    let path = this.FIRESTORE_DB_PATH + this.firestoreElementId + '/specificRecipes/' + specificRecipe.docs[0].id;
                    observer.next(new SpecificRecipe(specificRecipe.docs[0].data() as FirestoreSpecificRecipe, path, this.FIRESTORE_DATABASE));
                });
        });


    }

    protected extractDataToJSON(): FirestoreRecipe {

        return {
            access: this.access,
            ingredients: this.ingredients,
            name: this.name,
            description: this.description,
            notes: this.notes
        };

    }


}


