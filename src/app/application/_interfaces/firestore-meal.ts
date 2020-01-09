import { AccessData } from './accessData';

export type MealName = 'Zmorgen' | 'Zmittag' | 'Znacht' | 'Zvieri' | 'Znüni' | 'Leitersnack';

/**
 * Representiert ein FirestoreMeal, d.h. ein Meal in der Datenbank
 *
 */
export interface FirestoreMeal {

  title: string;
  description: string;

  access?: AccessData;
  firestoreElementId?: string;
  usedAs?: string;
  specificId?: string;
  participantsWarning?: boolean;
  keywords?: string;
  lastMeal?: string;

}
