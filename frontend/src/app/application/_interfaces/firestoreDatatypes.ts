import firebase from 'firebase/compat/app';
import Timestamp = firebase.firestore.Timestamp;
import FieldValue = firebase.firestore.FieldValue;

/**
 * Das AccessData Object regelt die Zugriffsberechtigung auf ein
 * Dokument in der FirestoreDatabase. Jedes Dokument, dass über eine
 * Collection Query aufgerufen werden kann verfühgt über ein solches
 * AccessDaten-Objekt.
 *
 * - **owner**: Der Benutzer, der das Dokument erstellt hat.
 * Ein owner hat vollen Zugriff auf die Daten, d.h. er hat im Normalfall
 * Lese-, Schreib- und Lösch-Berechtigung.
 *
 * - **editor**: Ein editor hat die selben Berechtigungen wie ein owner, d.h.
 * er hat im Normalfall Lese-, Schreib- und Lösch-Berechtigung. Aber er hat das Dokument
 * nicht erstellt.
 *
 * - **collaborator**: Ein collaborator hat eingeschränkte Berechtigungen. So kann er z.B.
 * nur die Rezeptdaten des aktuellen Lagers bearbeiten, nicht aber die Vorlagen usw.
 *
 * - **viewer**: Ein viewer hat nur Lese-Berechtigungen.
 *
 */
export type accessLevel = 'owner' | 'editor' | 'collaborator' | 'viewer';

export interface AccessData {
  [uid: string]: accessLevel;
}

/**
 * Repräsentiert ein einfaches FirebaseDocument
 *
 */
export interface FirestoreDocument {

  access: AccessData;
  date_added: Timestamp | FieldValue;
  date_modified: Timestamp | FieldValue;

}

/**
 * Representiert eine Tag eines Lagers.
 * Dieser Typ ist kein eigenständiges FirebaseDocument,
 * sondern lediglich ein Besandteil.
 *
 */
export interface DayData {

  day_date: Timestamp;
  day_description: string;
  day_notes: string;

}

/**
 * Representiert ein FirestoreCamp, d.h. ein Camp in der Datenbank.
 *
 */
export interface FirestoreCamp extends FirestoreDocument {

  camp_name: string;
  camp_description: string;
  camp_year: string;

  camp_participants: number;
  camp_vegetarians: number;
  camp_leaders: number;

  days: DayData[];

}

export interface FirestoreSettings {
  last_shown_changelog: string;
  show_templates: boolean;
  default_participants: number;
}


/**
 * Verwendung einer Mahlziet als Zmorgen, Zmittag, Znacht, Zvieri usw.
 *
 */
export type MealUsage = 'Zmorgen' | 'Zmittag' | 'Znacht' | 'Zvieri' | 'Znüni' | 'Leitersnack';

/**
 * Representiert ein FirestoreMeal, d.h. ein Meal in der Datenbank
 *
 */
export interface FirestoreMeal extends FirestoreDocument {

  meal_name: string;
  meal_description: string;

  meal_last_usage?: MealUsage;
  meal_keywords: string[];
  used_in_camps: string[];
  created_from_template: string;

}

export interface Ingredient {

  unique_id: string;
  food: string;
  measure: number;
  unit: string;
  comment: string;
  fresh: boolean;

}


export interface FirestoreRecipe extends FirestoreDocument {

  recipe_name: string;
  recipe_description: string;
  recipe_notes: string;
  created_from_template: string;

  ingredients: Ingredient[];
  used_in_meals: string[];

}

export type UserGroups = 'all' | 'vegetarians' | 'non-vegetarians' | 'leaders';

export interface FirestoreSpecificRecipe extends FirestoreDocument {
  used_in_meal: string;

  recipe_participants: number;
  recipe_override_participants: boolean;
  recipe_used_for: UserGroups;

  recipe_specificId: string;
  used_in_camp: string;

}

export interface FirestoreSpecificMeal extends FirestoreDocument {

  meal_participants: number;
  meal_override_participants: boolean;
  meal_used_as: MealUsage;
  meal_weekview_name: string;

  meal_gets_prepared: boolean;
  meal_prepare_date: Timestamp;
  meal_date: Timestamp;

  used_in_camp: string;
  meal_id: string;

}

export type UserVisibily = 'visible' | 'hidden';

export interface FirestoreUser extends FirestoreDocument {

  email: string;
  displayName: string;
  uid: string;
  visibility: UserVisibily;

}


