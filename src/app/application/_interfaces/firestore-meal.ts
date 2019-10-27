import { AccessData } from './accessData';

export interface FirestoreMeal {
    title: string,
    description: string,
    access: AccessData,
    firestoreElementId: string
}