import { AccessData } from './accessData';
import { DayData } from './day-data';

/**
 * Representiert ein FirestoreCamp, d.h. ein Camp in der Datenbank.
 *
 */
export interface FirestoreCamp {

  access: AccessData;

  name: string;
  description: string;
  participants: number;
  year: string;

  days: DayData[];

}
