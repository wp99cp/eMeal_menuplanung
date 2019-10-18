import { firestore } from 'firebase';
import { FirestoreMeal } from './firestore-meal';

export interface DayData {
    date: firestore.Timestamp,
    description: string,
    meals: FirestoreMeal[],

}