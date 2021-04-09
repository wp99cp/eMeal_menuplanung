import { db } from '.';
import * as functions from 'firebase-functions';
import { FirestoreSpecificMeal } from './interfaces/firestoreDatatypes';
import { firestore } from 'firebase-admin';

/**
 * 
 * Removes the camp id, if the deleted meal was the last in this camp.
 *
 * @param snapshot containing the id of the meal "{meals/{mealId}/specificMeals/{specificID}}"
 * @param context fn context (not used)
 *
 */
export async function onDeleteSpecificMeal(snapshot: FirebaseFirestore.DocumentSnapshot, context?: functions.EventContext) {

    if (snapshot.data === undefined)
        throw new Error();

    const specificMeal: FirestoreSpecificMeal = snapshot.data() as FirestoreSpecificMeal;
    const specificMealsRefs = db.collectionGroup('specificMeals').where('used_in_camp', '==', specificMeal.used_in_camp).get();

    if ((await specificMealsRefs).docs.length === 0) {

        const path = snapshot.ref.parent.parent?.path;
        if (path === undefined)
            throw new Error();
        
        db.doc(path).update({
            used_in_camps: firestore.FieldValue.arrayRemove(specificMeal.used_in_camp)
        }).catch();

    }

}
