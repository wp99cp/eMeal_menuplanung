import { db } from '.';
import * as functions from 'firebase-functions';

/**
 * This function deletes the recources of an camp (when it got deleted).
 * Deletes the specific recipes and meals of the deleted camp.
 * 
 * TODO: neu auch die CampClass spezifischen Daten eines Rezeptes oder einer Mahlzeit?
 *
 * @param snapshot containing the id of the camp "{id: campId}"
 * @param context fn context (not used)
 *
 */
export async function onDeleteCamp(snapshot: FirebaseFirestore.DocumentSnapshot, context?: functions.EventContext) {

    // query for specific recipes and camps
    const specificRecipesRefs = db.collectionGroup('specificRecipes').where('used_in_camp', '==', snapshot.id).get();
    const specificMealsRefs = db.collectionGroup('specificMeals').where('used_in_camp', '==', snapshot.id).get();

    // await the results
    await Promise.all([specificRecipesRefs, specificMealsRefs]);

    // delete the docs 
    (await specificRecipesRefs).forEach(doc => doc.ref.delete());
    (await specificMealsRefs).forEach(doc => doc.ref.delete());

}
