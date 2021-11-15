import {AccessData, FirestoreDocument, FirestoreMeal, FirestoreRecipe, Rules} from "./interfaces/firestoreDatatypes";
import {db} from "./index";
import * as functions from 'firebase-functions';
import {ResponseData} from "./CloudFunction";

/**
 *  Data needed to request a access change of a document.
 *  Format of the function call argument.
 *
 */
export interface AccessChange {

    documentPath: string;
    requestedAccessData: AccessData;
    upgradeOnly: boolean;

}

/**
 * Data needed to refresh the access rights for a camp after adding a recipe or a meal.
 *
 */
export interface Refresh {

    campId: string;
    type: 'meal' | 'recipe';
    path: string;

}

/**
 *
 * Changes the accessData of an object in the database.
 * AccessData can't be changed directly by the user all changes are handheld by this function.
 *
 * This operation runs in a transaction to prevent the database from failed or unfinished access changes.
 * Unfinished access changes lead to a security vulnerability.
 *
 * @param requestedChanges to the accessData
 * @param context of the function call
 */
export function changeAccessData(requestedChanges: AccessChange, context: functions.https.CallableContext): Promise<ResponseData> {

    return new Promise(async res => {
        await changeAccessDataWithTransaction(requestedChanges, context, false, undefined);
        return {};
    })

}

/**
 *
 * Refreshes the access data of a camp and its related documents after adding a meal or a recipe to the camp.
 *
 * TODO: Reduce cost of this expensive call... only modify the added meal of recipe and its dependencies...
 *
 * @param refreshRequest containing camp path, type of the added document and its path
 * @param context of the cloud function call
 *
 */
export function refreshAccessData(refreshRequest: Refresh, context: functions.https.CallableContext): Promise<any> {

    return new Promise(async (resolve) => {

        // get the access data form the camp
        const campAccessData = ((await db.doc('camps/' + refreshRequest.campId).get())
            .data() as FirestoreDocument).access;

        // create AccessChanges
        const accessChanges: AccessChange = {
            documentPath: 'camps/' + refreshRequest.campId,
            requestedAccessData: campAccessData,
            upgradeOnly: true
        }

        // execute all the changes...
        await changeAccessDataWithTransaction(accessChanges, context, true, undefined)

        resolve({message: 'AccessData successfully updated.'});
    });

}

/**
 *
 * Modifies the access data sucht that it contains the min rights for this recipes,
 * i.g. add inherited rights form meals which use this recipe.
 *
 * @param document snapshot of the recipe
 * @param access current access data to be modified
 *
 */
async function addMinRightsForRecipe(
    document: FirebaseFirestore.DocumentSnapshot,
    access: AccessData) {

    const recipeData = (document.data() as FirestoreRecipe);
    // upgrade to minimum rights
    const mealRefs = recipeData.used_in_meals;
    await Promise.all(mealRefs.map(async mealRef => {

        // get access data
        const mealAccessRights = ((await db.doc('meals/' + mealRef).get())
            .data() as FirestoreDocument).access;

        for (const uid in mealAccessRights) {

            // owner get decreased to editor
            mealAccessRights[uid] = mealAccessRights[uid] === 'owner' ? 'editor' : mealAccessRights[uid];
            access[uid] = access[uid] !== undefined && isElevation(mealAccessRights[uid], access[uid]) ?
                access[uid] : mealAccessRights[uid];
        }

    }));
}

/**
 *
 * Performs the access change inside a transaction.
 * This function can be called iterativ with different arguments.
 *
 * @param requestedChanges to the access data
 * @param context of the cloud function call
 * @param parentId optional parameter with a parent document id to exclude in some checks
 * @param onlyAccessNeeded
 */
async function changeAccessDataWithTransaction(
    requestedChanges: AccessChange,
    context: functions.https.CallableContext,
    onlyAccessNeeded: boolean,
    parentId ?: string | undefined) {

    const documentRef = db.doc(requestedChanges.documentPath);

    const document = await documentRef.get();

    // check if changes are valid
    if (!await isValidChange(document, requestedChanges, context, parentId, onlyAccessNeeded))
        throw new Error('Invalid access change!');

    // elevate rights...
    const documentData = document.data() as (FirestoreDocument | undefined) as FirestoreDocument;
    if (requestedChanges.upgradeOnly || containsOnlyElevations(documentData, requestedChanges.requestedAccessData)) {

        // update accessData in document
        const access = generateNewAccessData(JSON.parse(JSON.stringify(requestedChanges)), document);

        await elevateRelatedDocumentsRights(documentRef,
            JSON.parse(JSON.stringify(requestedChanges)), context, onlyAccessNeeded);

        // if it's a recipe check for min. access
        if (documentRef.parent.id === 'recipes')
            await addMinRightsForRecipe(document, access);

        // TODO: possible problem with transaction...
        console.log(documentRef.path + ' (1): ' + JSON.stringify(access));
        await documentRef.update({access});

    }

    // ... or decrease rights
    else {
        await decreaseRights(documentRef, requestedChanges, context, onlyAccessNeeded);
    }
}

/**
 * Decrease the rights of the document and its related documents
 *
 * @param documentRef to the document
 * @param requestedChanges to the access data
 * @param context of the cloud function call
 * @param onlyAccessNeeded
 *
 */
async function decreaseRights(
    documentRef: FirebaseFirestore.DocumentReference,
    requestedChanges: AccessChange,
    context: functions.https.CallableContext,
    onlyAccessNeeded: boolean) {

    const collectionName = documentRef.parent.id;

    // update accessData in document

    switch (collectionName) {

        case 'meals':

            // for recipes...
            // check if recipe is used in a meal with higher access rights
            // decrease to lowest access right possible

            const recipeRefs = await db.collection('recipes/')
                .where('used_in_meals', 'array-contains', documentRef.id).get();

            await Promise.all(recipeRefs.docs.map(async (doc) => {

                let minimumRights = JSON.parse(JSON.stringify(requestedChanges.requestedAccessData));
                await Promise.all((doc.data() as FirestoreRecipe).used_in_meals
                    .filter(mealId => mealId !== documentRef.id) // exclude current meal
                    .map(async mealId => {
                        const changes = {
                            documentPath: '',
                            requestedAccessData: minimumRights,
                            upgradeOnly: true
                        }
                        const meal = await db.doc('meals/' + mealId).get();
                        minimumRights = generateNewAccessData(changes, meal);
                    }));

                const newRights = JSON.parse(JSON.stringify(requestedChanges.requestedAccessData));

                // define minimal rights
                for (const uid in newRights) {
                    if (isElevation(newRights[uid], minimumRights[uid])) {
                        newRights[uid] = minimumRights[uid];
                    }
                }
                const changesToRecipe: AccessChange = {
                    documentPath: 'recipes/' + doc.id,
                    requestedAccessData: newRights,
                    upgradeOnly: false
                }

                // catch exceptions, it may not be possible to decrease the rights of the recipes
                try {
                    await changeAccessDataWithTransaction(
                        JSON.parse(JSON.stringify(changesToRecipe)), context, true, documentRef.id);
                } catch (error) {
                    console.log(error);
                }

            }));

            // TODO: possible problem with transaction...
            // update accessData in document
            console.log(documentRef.path + '(2): ' + JSON.stringify(requestedChanges.requestedAccessData));
            await documentRef.update({access: requestedChanges.requestedAccessData});

            break;

        case 'recipes':

            // TODO: possible problem with transaction...
            // update accessData in document
            console.log(documentRef.path + '(3): ' + JSON.stringify(requestedChanges.requestedAccessData));
            await documentRef.update({access: requestedChanges.requestedAccessData});

            break;

        // change nothing
        default:
            throw new Error('Decreasing rights of a user on this document type is not supported!');


    }

}

/**
 * Elevates rights of related documents
 *
 * @param documentRef
 * @param requestedChanges
 * @param context
 * @param onlyAccessNeeded
 *
 */
async function elevateRelatedDocumentsRights(
    documentRef: FirebaseFirestore.DocumentReference,
    requestedChanges: AccessChange,
    context: functions.https.CallableContext,
    onlyAccessNeeded: boolean) {

    const collectionName = documentRef.parent.id;

    switch (collectionName) {

        // elevate the rules of users in all related meals and specificMeals and specificRecipes
        case 'camps':

            // update all meals to read access...
            const mealRefs = await db.collection('meals')
                .where('used_in_camps', 'array-contains', documentRef.id).get();

            console.log('Meals: ' + mealRefs.docs.map(doc => doc.id).toString());

            // minimum rights for meals is viewer
            // except for the owner of a camp he gets editor rights for all meals
            const access = JSON.parse(JSON.stringify(requestedChanges.requestedAccessData));
            for (const uid in access) {
                access[uid] = (access[uid] === 'editor' || access[uid] === 'owner' ? 'editor' : 'viewer');
            }

            // update meals and recipes to min viewer
            await Promise.all(mealRefs.docs.map(async (mealRef) =>
                changeAccessDataWithTransaction({
                    upgradeOnly: true,
                    documentPath: 'meals/' + mealRef.id,
                    requestedAccessData: access
                }, context, true, documentRef.id)
            ));

            // refs of specificMeals used in this camp
            const specMealRefs = await db.collectionGroup('specificMeals')
                .where('used_in_camp', '==', documentRef.id).get();
            await Promise.all(specMealRefs.docs.map((mealRef) =>
                mealRef.ref.update({access: requestedChanges.requestedAccessData})
            ));

            // refs of specificRecipes used in this camp
            const specRecipeRefs = await db.collectionGroup('specificRecipes')
                .where('used_in_camp', '==', documentRef.id).get();
            await Promise.all(specRecipeRefs.docs.map((recipeRef) =>
                recipeRef.ref.update({access: requestedChanges.requestedAccessData})
            ));

            break;


        // elevate the rules of users in all related recipes
        case 'meals':

            // refs of recipes used in this meal
            const docRefs = await db.collection('recipes')
                .where('used_in_meals', 'array-contains', documentRef.id).get();

            // update rights for each recipe
            await Promise.all(docRefs.docs.map(async (recipeRef) => {
                const recipeChanges = {
                    upgradeOnly: true,
                    documentPath: 'recipes/' + recipeRef.id,
                    requestedAccessData: requestedChanges.requestedAccessData
                };

                // changing the rights of a meal may not be possible
                try {
                    await changeAccessDataWithTransaction(
                        JSON.parse(JSON.stringify(recipeChanges)), context, true, documentRef.id);
                } catch (error) {
                    console.log(error);
                }

            }));

            break;

        // e.g. "recipes" do nothing
        default:
            break;

    }

}


/**
 *
 * Checks if the changes to the accessData for this document is valid.
 * This function defines all security rules related to change access of a document!
 *
 * @param document to apply the changes
 * @param requestedAccessData requested changes to the accessData
 * @param context of the function call
 * @param parentId
 * @param onlyAccessNeeded
 *
 */
async function isValidChange(
    document: FirebaseFirestore.DocumentSnapshot,
    requestedAccessData: AccessChange,
    context: functions.https.CallableContext,
    parentId: string | undefined,
    onlyAccessNeeded?: boolean) {

    // request document content
    const documentData = document.data() as (FirestoreDocument | undefined);
    if (documentData === undefined) {
        throw new Error('Invalid documentPath!');
    }

    // get uid form the context of the callable function
    const uid = context.auth?.uid;
    if (uid === undefined)
        throw new Error('User not authenticated!');

    // check if user has owner access on the document
    const ruleOfCurrentUser = documentData.access[uid];
    if (ruleOfCurrentUser !== 'owner' && !onlyAccessNeeded)
        throw new Error('Only the owner can change the access data!');

    // the owner of the document can't be changed, you can't add a second owner
    if (!requestedAccessData.upgradeOnly && (requestedAccessData.requestedAccessData[uid] !== 'owner' ||
        Object.values(requestedAccessData.requestedAccessData).filter(v => v === 'owner').length !== 1))

        throw new Error('The owner of the document (' + document.ref.path + ') can\'t be changed!');

    // Allow elevation of rules.
    if (requestedAccessData.upgradeOnly || containsOnlyElevations(documentData, requestedAccessData.requestedAccessData))
        return true;

    // Check decreasing of the rules
    const collectionName = document.ref.parent.id;
    switch (collectionName) {

        case 'meals':

            // generate minimum rights for this meal
            const usedInCamps = (documentData as FirestoreMeal).used_in_camps;
            let minimumRights: AccessData = {};

            // meal isn't used in any camp
            if (usedInCamps !== undefined) {
                await Promise.all(usedInCamps.map(async (campId) => {

                    const changes = {
                        documentPath: '',
                        requestedAccessData: minimumRights,
                        upgradeOnly: true
                    }

                    minimumRights = generateNewAccessData(changes, await db.doc('camps/' + campId).get());

                }));
            }
            // check if rights can be decreased
            for (const userId in minimumRights) {
                if (
                    // deleting not allowed since user has access to camp
                    requestedAccessData.requestedAccessData[userId] === undefined ||
                    // or allowed scenario (and than negated):
                    // access to camp is lower than the rights to the meal
                    // or user has collaborator access to the camp and at least viewer access to the meal
                    !((minimumRights[userId] === 'collaborator' && requestedAccessData.requestedAccessData[userId] === 'viewer') ||
                        isElevation(minimumRights[userId], requestedAccessData.requestedAccessData[userId]))) {

                    throw new Error('Decreasing not allowed! There exist a camp with higher rights!');
                }
            }

            return true;

        // Check for recipes
        case 'recipes':

            // checks if the decreased rights are higher than the rights in all related documents
            const usedInMeals = (documentData as FirestoreRecipe).used_in_meals;
            await Promise.all(usedInMeals
                .filter(mealId => mealId !== parentId)
                .map(async (mealId) => {

                    const docData = (await db.doc('meals/' + mealId).get()).data() as FirestoreMeal;

                    // Parent document can keep its rights
                    // i.g. the rights in the child document stays lower
                    for (const userID in docData.access) {
                        if (!isElevation(docData.access[userID], requestedAccessData.requestedAccessData[userID]))
                            throw new Error('Decreasing not allowed! There exist a meal with higher rights!');
                    }

                }));

            return true;

        // default not allowed
        default:
            throw new Error('Decreasing rights of a user on this document type is not supported!');

    }

}

/**
 *
 *
 * @param doc
 * @param reqAccess
 *
 */
function containsOnlyElevations(doc: FirestoreDocument, reqAccess: AccessData) {

    let onlyElevations = true;
    for (const uid in doc.access) {
        onlyElevations = onlyElevations && isElevation(doc.access[uid], reqAccess[uid])
    }
    return onlyElevations;

}

/**
 * Generates the new accessData for the document.
 *
 * If requestedChanges.upgradeOnly is set to false this function returns the value of the
 * requestedChanges.requestedAccessData field. Otherwise it will elevate the rules such that
 * all user has a minimum access level as described in requestedChanges.requestedAccessData.
 *
 * Access level of users not mention in requestedChanges.requestedAccessData will not be changed.
 *
 * @param requestedChanges
 * @param document
 */
function generateNewAccessData(
    requestedChanges: AccessChange,
    document: FirebaseFirestore.DocumentSnapshot) {

    // only upgrades rights
    if (requestedChanges.upgradeOnly) {

        const oldAccess = (document.data() as FirestoreDocument).access;

        // check for every user currently has access
        for (const uid in oldAccess) {

            // access data stays untouched
            if (requestedChanges.requestedAccessData[uid] === undefined) {
                requestedChanges.requestedAccessData[uid] = oldAccess[uid];
            }
            // copy higher rights to requestedChanges.requestedAccessData
            else if (!isElevation(oldAccess[uid], requestedChanges.requestedAccessData[uid])) {
                requestedChanges.requestedAccessData[uid] = oldAccess[uid];
            }

        }

    }

    return requestedChanges.requestedAccessData;
}


/**
 *
 * Check if the change of the rule is an elevation.
 * Returns true if rules are identical.
 *
 */
function isElevation(oldRule: Rules, newRule: Rules) {

    // identical
    if (oldRule === newRule)
        return true;

    // check elevation
    if (oldRule === 'viewer' && (newRule === 'collaborator' || newRule === 'editor' || newRule === 'owner'))
        return true;
    if (oldRule === 'collaborator' && (newRule === 'editor' || newRule === 'owner'))
        return true;

    return oldRule === 'editor' && newRule === 'owner';

}
