import { Ingredient } from './ingredient';
import { AccessData } from './accessData';

export interface FirestoreRecipe {
  ingredients: Ingredient[];
  name: string;
  description: string;
  readonly access: AccessData;
  notes: string;
}
