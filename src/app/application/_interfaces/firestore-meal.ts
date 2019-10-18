import { AccessData } from './accessData';

export interface FirestoreMeal {
    title: string,
    desciption: string,
    access: AccessData,
    readonly firestoreElementId: string
}