import * as functions from 'firebase-functions/v1';
import {FieldValue, Timestamp} from 'firebase-admin/firestore';
import {db} from './index';
import {
    AccessData,
    FirestoreCamp,
    FirestoreMeal,
    FirestoreRecipe,
    FirestoreSpecificMeal,
    FirestoreSpecificRecipe
} from './interfaces/firestoreDatatypes';

/**
 * Data needed to copy a camp.
 * Format of the function call argument.
 *
 */
export interface CopyCampRequest {

    campId: string;
    name: string;
    // The dates of the days of the new camp in milliseconds, one for each day of the copied camp. They are calculated
    // by the client, a day starts at midnight in the time zone of the user.
    days: number[];

}

const MAX_NAME_LENGTH = 32;

// the days of the new camp have to be in this century
const MIN_DATE = Date.UTC(2000, 0, 1);
const MAX_DATE = Date.UTC(2100, 0, 1);

// a batch can contain up to 500 writes
const MAX_BATCH_SIZE = 400;

/**
 * A document the copy creates, or a meal that gets linked to the new camp.
 */
type Write = { ref: FirebaseFirestore.DocumentReference } &
    ({ create: FirebaseFirestore.DocumentData } | { link: string });

/**
 *
 * Copies a camp. The calling user becomes the owner of the copy and is the only one with access to it.
 *
 * The copy contains the same meals on the same days. A meal the user can edit is linked, i.e. both camps use the
 * same meal and recipes, only the settings inside the camp (specificMeals, specificRecipes and overwrites) are
 * copied. A meal the user can only read is copied together with its recipes. Otherwise, the user would get write
 * access to the meal as soon as the new camp is shared, since the editors of a camp can edit its meals.
 *
 * @param request the camp to copy, the name and the days of the new camp
 * @param context of the function call
 *
 * @returns the id of the new camp
 *
 */
export async function copyCamp(request: CopyCampRequest, context: functions.https.CallableContext): Promise<any> {

    const uid = context.auth?.uid;
    if (uid === undefined)
        throw new functions.https.HttpsError('unauthenticated', 'User not authenticated!');

    if (typeof request?.campId !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(request.campId))
        throw new functions.https.HttpsError('invalid-argument', 'Invalid camp!');

    const name = typeof request.name === 'string' ? request.name.trim() : '';
    if (name.length === 0 || name.length > MAX_NAME_LENGTH)
        throw new functions.https.HttpsError('invalid-argument', 'Invalid name!');

    const campSnapshot = await db.doc('camps/' + request.campId).get();
    const camp = campSnapshot.data() as FirestoreCamp | undefined;

    // a camp without access is reported like a missing one
    if (camp === undefined || !canRead(camp.access, uid))
        throw new functions.https.HttpsError('not-found', 'Camp not found!');

    // the days are sorted, the first new date belongs to the first day of the camp
    const oldDays = [...(camp.days ?? [])].sort((a, b) => a.day_date.toMillis() - b.day_date.toMillis());

    const newDates = request.days;
    if (!Array.isArray(newDates) || newDates.length !== oldDays.length ||
        newDates.some((date, i) => !Number.isSafeInteger(date) || date < MIN_DATE || date > MAX_DATE ||
            (i > 0 && date <= newDates[i - 1])))
        throw new functions.https.HttpsError('invalid-argument', 'Invalid days!');

    const access: AccessData = {[uid]: 'owner'};
    const newCampRef = db.collection('camps').doc();
    const writes: Write[] = [];

    // maps the date of a day of the copied camp to the one of the new camp
    const dates = new Map<number, Timestamp>(
        oldDays.map((day, i) => [day.day_date.toMillis(), Timestamp.fromMillis(newDates[i])]));
    const offset = oldDays.length > 0 ? newDates[0] - oldDays[0].day_date.toMillis() : 0;
    const shiftDate = (date: unknown) => date instanceof Timestamp ?
        (dates.get(date.toMillis()) ?? Timestamp.fromMillis(date.toMillis() + offset)) : date;

    const [specificMeals, specificRecipes] = await Promise.all([
        db.collectionGroup('specificMeals').where('used_in_camp', '==', request.campId).get(),
        db.collectionGroup('specificRecipes').where('used_in_camp', '==', request.campId).get()]);

    // the meals of the camp, a meal can be used more than once
    const mealIds = [...new Set(specificMeals.docs.map(doc => (doc.ref.parent.parent as FirebaseFirestore.DocumentReference).id))];
    const meals = await Promise.all(mealIds.map(mealId => db.doc('meals/' + mealId).get()));

    // maps the id of a meal resp. a recipe to its id in the new camp, linked ones keep their id
    const newMealIds = new Map<string, string>();
    const newRecipeIds = new Map<string, Map<string, string>>();
    const overwrites = new Map<string, string>();

    await Promise.all(meals.map(async mealSnapshot => {

        const meal = mealSnapshot.data() as FirestoreMeal | undefined;

        // The meal got deleted or the user has no access to it, its usages are not copied. Every user can create
        // a specific meal below any meal, hence a usage in the camp does not prove that the meal belongs to it.
        if (meal === undefined || !canRead(meal.access, uid))
            return;

        const recipes = await db.collection('recipes').where('used_in_meals', 'array-contains', mealSnapshot.id).get();
        const recipeIds = new Map<string, string>();
        newRecipeIds.set(mealSnapshot.id, recipeIds);

        if (canWrite(meal.access, uid)) {

            newMealIds.set(mealSnapshot.id, mealSnapshot.id);
            recipes.docs.forEach(recipe => recipeIds.set(recipe.id, recipe.id));
            writes.push({ref: mealSnapshot.ref, link: newCampRef.id});

        } else {

            const newMealRef = db.collection('meals').doc();
            newMealIds.set(mealSnapshot.id, newMealRef.id);

            writes.push({
                ref: newMealRef, create: {
                    ...meal,
                    ...copyOf(mealSnapshot.id, meal.access, access),
                    used_in_camps: [newCampRef.id]
                }
            });

            recipes.docs.forEach(recipeSnapshot => {

                const recipe = recipeSnapshot.data() as FirestoreRecipe;

                // the recipes have an access of their own
                if (!canRead(recipe.access, uid))
                    return;

                const newRecipeRef = db.collection('recipes').doc();
                recipeIds.set(recipeSnapshot.id, newRecipeRef.id);

                writes.push({
                    ref: newRecipeRef, create: {
                        ...recipe,
                        ...copyOf(recipeSnapshot.id, recipe.access, access),
                        used_in_meals: [newMealRef.id]
                    }
                });

            });

        }

        // the ingredients of a recipe which are overwritten in the camp
        recipeIds.forEach((newRecipeId, recipeId) =>
            overwrites.set('recipes/' + recipeId + '/overwrites/' + request.campId,
                'recipes/' + newRecipeId + '/overwrites/' + newCampRef.id));

    }));

    await Promise.all([...overwrites].map(async ([path, newPath]) => {
        const overwrite = (await db.doc(path).get()).data();
        if (overwrite !== undefined)
            writes.push({ref: db.doc(newPath), create: 'access' in overwrite ? {...overwrite, access} : overwrite});
    }));

    // maps the id of a specific meal to its id in the new camp, the specific recipes use the same id
    const newSpecificIds = new Map<string, string>();
    const mealOfSpecificId = new Map<string, string>();

    specificMeals.docs.forEach(snapshot => {

        const specificMeal = snapshot.data() as FirestoreSpecificMeal;
        const mealId = (snapshot.ref.parent.parent as FirebaseFirestore.DocumentReference).id;
        const newMealId = newMealIds.get(mealId);

        if (newMealId === undefined)
            return;

        const newRef = db.collection('meals/' + newMealId + '/specificMeals').doc();
        newSpecificIds.set(snapshot.id, newRef.id);
        mealOfSpecificId.set(snapshot.id, mealId);

        writes.push({
            ref: newRef, create: defined({
                ...specificMeal,
                ...newDocument(access),
                meal_date: shiftDate(specificMeal.meal_date),
                meal_prepare_date: shiftDate(specificMeal.meal_prepare_date),
                meal_id: newMealId,
                used_in_camp: newCampRef.id
            })
        });

    });

    specificRecipes.docs.forEach(snapshot => {

        const specificRecipe = snapshot.data() as FirestoreSpecificRecipe;
        const recipeId = (snapshot.ref.parent.parent as FirebaseFirestore.DocumentReference).id;
        const newSpecificId = newSpecificIds.get(snapshot.id);

        // The specific recipe has the id of its specific meal, which belongs to the meal. Older specific recipes
        // have no field 'used_in_meal'.
        const mealId = mealOfSpecificId.get(snapshot.id);
        const newMealId = mealId === undefined ? undefined : newMealIds.get(mealId);
        const newRecipeId = mealId === undefined ? undefined : newRecipeIds.get(mealId)?.get(recipeId);

        // the specific recipe belongs to a meal that is not copied or to a recipe which got removed from its meal
        if (newSpecificId === undefined || newMealId === undefined || newRecipeId === undefined)
            return;

        writes.push({
            ref: db.doc('recipes/' + newRecipeId + '/specificRecipes/' + newSpecificId), create: defined({
                ...specificRecipe,
                ...newDocument(access),
                recipe_specificId: newSpecificId,
                used_in_meal: newMealId,
                used_in_camp: newCampRef.id
            })
        });

    });

    // The camp is written last: as long as the copy is not complete, no camp with missing meals shows up.
    writes.push({
        ref: newCampRef, create: defined({
            ...camp,
            ...newDocument(access),
            camp_name: name,
            camp_year: newDates.length > 0 ? yearOf(newDates[0]) : camp.camp_year,
            days: oldDays.map((day, i) => ({...day, day_date: Timestamp.fromMillis(newDates[i])}))
        })
    });

    const apply = (batch: FirebaseFirestore.WriteBatch, write: Write) => 'create' in write ?
        batch.create(write.ref, write.create) :
        batch.update(write.ref, {used_in_camps: FieldValue.arrayUnion(write.link)});

    // a large camp needs more than one batch, which are not atomic together
    let committed = 0;
    try {
        for (; committed < writes.length; committed += MAX_BATCH_SIZE) {
            const batch = db.batch();
            writes.slice(committed, committed + MAX_BATCH_SIZE).forEach(write => apply(batch, write));
            await batch.commit();
        }
    } catch (error) {
        console.error('Copy of camp ' + request.campId + ' failed.', error);
        await revert(writes.slice(0, committed));
        throw new functions.https.HttpsError('internal', 'The camp could not be copied!');
    }

    return {campId: newCampRef.id};

}

/**
 * Removes the documents of a copy which failed after some of its batches got committed.
 */
async function revert(writes: Write[]) {

    for (let i = 0; i < writes.length; i += MAX_BATCH_SIZE) {
        const batch = db.batch();
        writes.slice(i, i + MAX_BATCH_SIZE).forEach(write => 'create' in write ?
            batch.delete(write.ref) :
            // the meal exists, the batch which linked it got committed
            batch.update(write.ref, {used_in_camps: FieldValue.arrayRemove(write.link)}));
        await batch.commit().catch(error => console.error('Could not revert the failed copy.', error));
    }

}

/**
 * Removes the undefined fields, a document must not contain them. Older documents miss some fields.
 */
function defined<T extends object>(document: T) {
    return Object.fromEntries(Object.entries(document).filter(([, value]) => value !== undefined));
}

function canRead(access: AccessData | undefined, uid: string) {
    return access !== undefined && (['owner', 'editor', 'collaborator', 'viewer'].includes(access[uid]) ||
        (access as { [key: string]: string }).all_users === 'viewer');
}

function canWrite(access: AccessData | undefined, uid: string) {
    return access !== undefined && ['owner', 'editor'].includes(access[uid]);
}

/**
 * The fields every new document gets.
 */
function newDocument(access: AccessData) {
    return {access, date_added: FieldValue.serverTimestamp(), date_modified: FieldValue.serverTimestamp()};
}

/**
 * The fields of a copied meal or recipe, as the frontend sets them: the copy of a template refers to it.
 */
function copyOf(documentId: string, oldAccess: AccessData, access: AccessData) {
    return {
        ...newDocument(access),
        ...((oldAccess as { [key: string]: string })?.all_users === 'viewer' ? {created_from_template: documentId} : {})
    };
}

/**
 * The year of a day. A day starts at midnight in the time zone of the user, which is not known here. Noon of
 * that day is in the same year in every time zone that is less than 12 hours away from UTC.
 */
function yearOf(date: number) {
    return String(new Date(date + 12 * 60 * 60 * 1000).getUTCFullYear());
}
