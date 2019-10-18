import { AccessData } from '../_interfaces/accessData';
import { Ingredient } from '../_interfaces/ingredient';
import { FirestoreRecipe } from '../_interfaces/firestore-recipe';

export class Recipe implements FirestoreRecipe {

    access: AccessData;
    ingredients: Ingredient[];
    name: string;
    description: string;

    constructor() {

    }

}


