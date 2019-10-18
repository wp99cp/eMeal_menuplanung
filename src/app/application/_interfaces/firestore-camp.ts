import { AccessData } from './accessData';
import { DayData } from './day-data';

export interface FirestoreCamp {
    name: string,
    description: string,
    participants: number,
    year: string,
    days: DayData[],
    readonly access: AccessData
}