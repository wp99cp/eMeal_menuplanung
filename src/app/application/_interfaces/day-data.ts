import { firestore } from 'firebase';
import { FirestoreMeal } from './firestore-meal';

/**
 * Daten eines Tages.
 *
 */
export interface DayData {

  date: firestore.Timestamp;
  meals: FirestoreMeal[];

  description?: string;

}
