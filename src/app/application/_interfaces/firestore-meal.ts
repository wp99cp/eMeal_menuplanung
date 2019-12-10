import { SpecificMeal } from './../_class/specific-meal';
import { AccessData } from './accessData';

export interface FirestoreMeal {
  title: string;
  description: string;
  access?: AccessData;
  firestoreElementId: string;
  usedAs?: string;
  specificId?: string;
}
