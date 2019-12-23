import { Ingredient } from './ingredient';
import { AccessData } from './accessData';

export interface FirestoreRecipe {
  ingredients: Ingredient[];
  name: string;
  description: string;
  access: AccessData;
  notes: string;
}
