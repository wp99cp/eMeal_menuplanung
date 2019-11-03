import { Observable } from 'rxjs';
import { AccessData } from '../_interfaces/accessData';
import { FirestoreMeal } from '../_interfaces/firestore-meal';
import { Camp } from './camp';
import { FirebaseObject } from "./firebaseObject";
import { Recipe } from './recipe';
import { SpecificMeal } from './specific-meal';

export class Meal extends FirebaseObject implements FirestoreMeal {

    public readonly firestorePath = 'meals/';

    public title: string;
    public description: string;
    public access: AccessData;

    public specificMeal: Observable<SpecificMeal>;
    private recipes: Observable<Recipe[]> = null;


    constructor(data: FirestoreMeal, public readonly firestoreElementId: string) {

        super();

        this.title = data.title;
        this.description = data.description;
        this.access = data.access;

    }



    /** loads the specific Meal data */
    private loadSpecificMeal(relatedCampId: string) {

        /*
        this.specificMeal = Observable.create((observer: Observer<SpecificMeal>) => {

            this.FIRESTORE_DATABASE
                .collection(Meal.firestorePath + this.firestoreElementId + '/specificMeals',
                    collRef => collRef.where('campId', "==", this.relatedCampId).limit(1)).get()
                .subscribe(specificMeal => {
                    let path = Meal.firestorePath + this.firestoreElementId + '/specificMeals/' + specificMeal.docs[0].id;
                    observer.next(new SpecificMeal(specificMeal.docs[0].data() as FirestoreSpecificMeal, path, this.FIRESTORE_DATABASE));
                });
        });

*/

    }

    public extractDataToJSON(): FirestoreMeal {

        let firestoreMeal = {
            title: this.title,
            description: this.description,
            access: this.access,
            firestoreElementId: this.firestoreElementId
        };

        // Meals generated out of a day don't contain access and description properties
        // They are removed if they're undefinded...
        if (firestoreMeal.access == undefined) delete firestoreMeal.access;
        if (firestoreMeal.description == undefined) delete firestoreMeal.description;

        return firestoreMeal;

    }

    /**  */
    public getRecipes(): Observable<Recipe[]> {

        throw "Fehlr noch";
        /*

        if (this.recipes != null) {

            return this.recipes;
        }
        else {

            // loadRecipes
            this.recipes = Observable.create((observer: Observer<Recipe[]>) => {
                this.FIRESTORE_DATABASE.collection(Meal.firestorePath + this.firestoreElementId + '/recipes', collRef =>
                    collRef.where('access.owner', "array-contains", Meal.user.uid))
                    .snapshotChanges()
                    // Create new Meals out of the data
                    .pipe(map(docActions =>
                        docActions.map(docAction =>
                            new Recipe(
                                docAction.payload.doc.data() as FirestoreRecipe,
                                docAction.payload.doc.id,
                                this.firestoreElementId,
                                this.FIRESTORE_DATABASE,
                                this.relatedCampId
                            )
                        ))
                    ).subscribe(recipes =>
                        observer.next(recipes)
                    );
            });


            return this.recipes;

        }

        */
        return null;
    }

    /**
     * 
     * Creates specific meal and recipe documents in the database for a related camp
     * 
     * @param camp Releted Camp 
     */
    public createSpecificData(camp: Camp) {

        throw "Funktion zur Zeit nocht möglich";
        /*

        let specificMealData: FirestoreSpecificMeal = {
            participants: camp.participants,
            campId: camp.firestoreElementId
        };
        this.FIRESTORE_DATABASE.collection(Meal.firestorePath + this.firestoreElementId + '/specificMeals').add(specificMealData);

        this.getRecipes().subscribe(recipes => recipes.forEach(recipe => {

            let specificRecipeData: FirestoreSpecificRecipe = {
                participants: camp.participants,
                campId: camp.firestoreElementId
            };
            let path = Meal.firestorePath + this.firestoreElementId + '/recipes/' + recipe.firestoreElementId + "/specificRecipes";
            this.FIRESTORE_DATABASE.collection(path).add(specificRecipeData);

        }));

        */

    }

}