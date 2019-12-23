import { Ingredient } from './ingredient';

export interface RawMealData {

  baseMeasure: number;
  baseMeasureUnit: string;
  source: string;
  created: string;
  notes: string;
  recipes: RawRecipeData[];
  title: string;

}

export interface RawRecipeData {

  title: string;
  ingredients: Ingredient[];

}

export interface ErrorOnImport {

  error: string;

}
