import {db, projectId} from '..';
import {ExportedCamp, ExportedDay, ExportedMeal, ExportedRecipe} from '../interfaces/exportDatatypes';
import {FirestoreSpecificMeal, FirestoreSpecificRecipe} from '../interfaces/firestoreDatatypes';
import {Categories, ShoppingListCreator, Units} from './shopping-list';
import {firestore} from 'firebase-admin';

export class InvalidDocumentPath extends Error {
}

/**
 *
 * Exports all infos for a camp. This function is called to export the camp as
 * a "Lagerhandbuch". It contains all the data about a camp and could also be used
 * to export and re-import a camp to the database (not yet implemented).
 *
 * @param campId contains the id of the camp
 * @returns all the date of the camp as an ExportedCamp object
 *
 */
export async function exportCamp(campId: string): Promise<ExportedCamp> {

    const camp = await loadCamp(campId);


    const categories = (await db.doc('/sharedData/categories').get()).data() as Categories;
    const units = (await db.doc('/sharedData/units').get()).data() as Units;

    await loadDays(camp, categories, units);
    await createCampShoppingList(camp, categories, units);

    // For debugging. In the localhost firestore the exportedCamp
    // gets saved in the collection 'camps/{campId}/exports-data'
    if (projectId === 'cevizh11') {
        await db.collection('camps/' + campId + '/exports-data').add(camp);
    }

    return camp;

}

/**
 * Loads the document of the camp "camps/{campId}".
 * Sorts the "camp.days" of the camp in the proper order (by date).
 *
 * @param campData the content of the document of the camp
 *
 */
async function loadCamp(campId: string): Promise<ExportedCamp> {

    // load data form the database
    const camp = (await db.doc('camps/' + campId).get()).data() as ExportedCamp;
    camp.documentId = campId;

    if (camp === undefined)
        throw new InvalidDocumentPath();

    // setzt das Datum
    for (const day of camp?.days) {
        day.day_date_as_date = new Date(day.day_date.seconds * 1000);
    }

    // sortiert die Tage
    camp.days?.sort((a, b) =>
        a.day_date_as_date.getTime() - b.day_date_as_date.getTime()
    );

    return camp;

};

/**
 * Loads the data of the days.
 * Loads the meal, specificMeal, recipes and specificRecipes
 * and sets this data as a ExportedDay to the camp.days field.
 *
 *
 * @param camp ExportedCamp as object
 * @returns a void Promise which resolves after loading data
 *
 */
async function loadDays(camp: ExportedCamp, categories: Categories, units: Units): Promise<void> {

    // load meals of the day
    const dayPromises = camp.days.map(async day => loadDay(camp, day, categories, units));
    camp.days = await Promise.all(dayPromises);

    // load meals top prepare befor the camp starts
    const prepareMealsRefs = (await db.collectionGroup('specificMeals')
        .where('used_in_camp', '==', camp.documentId)
        .where('meal_gets_prepared', '==', true)
        .where('meal_prepare_date', '<', camp.days[0].day_date)
        .get()).docs;
    const prepareMealPromises = prepareMealsRefs.map(async specificMealRef => loadMeal(camp, specificMealRef));
    camp.meals_to_prepare = await Promise.all(prepareMealPromises);

    return;

}

/**
 *
 * Loads the meals of a ExportedDay in a ExportedCamp.
 * This function needs a "COLLECTION_GROUP_ASC index".
 * But it's the same as in the frontend.
 *
 * @param camp ExportedCamp
 * @param day ExportedDay
 *
 */
async function loadDay(camp: ExportedCamp, day: ExportedDay, categories: Categories, units: Units): Promise<ExportedDay> {

    // load meals and recipes
    const mealsRefs = (await db.collectionGroup('specificMeals')
        .where('used_in_camp', '==', camp.documentId)
        .where('meal_date', '==', day.day_date)
        .get()).docs;

    const mealPromises = mealsRefs.map(async (specificMealRef) => loadMeal(camp, specificMealRef));
    day.meals = await Promise.all(mealPromises);

    // load meals top prepare
    const prepareMealsRefs = (await db.collectionGroup('specificMeals')
        .where('used_in_camp', '==', camp.documentId)
        .where('meal_gets_prepared', '==', true)
        .where('meal_prepare_date', '==', day.day_date)
        .get()).docs;
    const prepareMealPromises = prepareMealsRefs.map(async (specificMealRef) => loadMeal(camp, specificMealRef));
    day.meals_to_prepare = await Promise.all(prepareMealPromises);

    // Sortiert die Mahlzeiten
    day.meals = day.meals.sort(mealCompareFn);

    // create shoppingList of this day
    await createDayShoppingList(day, categories, units);

    return day;


}

/**
 *
 * CompareFn to sort meals by date and then by it's "usedAs" Value
 * After this sorting the meals are in the proper order,
 * i.e. the order in which they get cooked in the camp.
 *
 * @param meals list of meals to sort
 *
 */
function mealCompareFn(a: ExportedMeal, b: ExportedMeal) {

    const orderOfMahlzeiten = ['Zmorgen', 'Znüni', 'Zmittag', 'Zvieri', 'Znacht', 'Leitersnack', 'Vorbereiten'];

    // sortiert nach Verwendung
    if (a.meal_data_as_date.getTime() === b.meal_data_as_date.getTime()) {

        return orderOfMahlzeiten.indexOf(a.meal_used_as) - orderOfMahlzeiten.indexOf(b.meal_used_as);
    }

    // sortiert nach Datum
    return a.meal_data_as_date.getTime() - b.meal_data_as_date.getTime();

}

/**
 *
 * Loads the meal and combine it with the specificMeal to the ExportedMeal
 *
 * @param day
 * @param specificMealRef
 */
async function loadMeal(camp: ExportedCamp, specificMealRef: FirebaseFirestore.QueryDocumentSnapshot):
    Promise<ExportedMeal> {

    // load specificMeal
    const specificMeal = specificMealRef.data() as FirestoreSpecificMeal;
    const mealId = specificMealRef.ref.path.split('/')[1];
    const meal = (await db.doc('meals/' + mealId).get()).data() as ExportedMeal;

    // combine the data oft the specificMeal with the data from the meal
    meal.meal_participants = specificMeal.meal_override_participants ? specificMeal.meal_participants : camp.camp_participants;
    meal.meal_weekview_name = specificMeal.meal_weekview_name;
    meal.meal_used_as = specificMeal.meal_used_as;
    meal.meal_gets_prepared = specificMeal.meal_gets_prepared;
    meal.meal_prepare_date = new Date(specificMeal.meal_prepare_date.seconds * 1000);
    meal.meal_data_as_date = new Date(specificMeal.meal_date.seconds * 1000);

    const recipesRefs = await (await db.collection('recipes').where('used_in_meals', 'array-contains', mealId).get()).docs;
    const recipePromises = recipesRefs.map(async recipeRef => loadRecipe(camp, recipeRef, specificMealRef.id, meal));
    meal.recipes = await Promise.all(recipePromises);

    return meal;

}

/**
 *
 *
 *
 * @param camp
 * @param day
 * @param recipeRef
 * @param specificId
 */
async function loadRecipe(camp: ExportedCamp, recipeRef: FirebaseFirestore.QueryDocumentSnapshot, specificId: string, meal: ExportedMeal):
    Promise<ExportedRecipe> {


    // load specificMeal
    let specificRecipe = (await db.doc('recipes/' + recipeRef.id + '/specificRecipes/' + specificId).get()).data() as FirestoreSpecificRecipe;

    // the specificRecipe is undefined if the meal never got eddited...
    // in this case the export function faces the default data.
    // This only works since there is no group collection query for the specificRecipes...
    // TODO: allways generate also the specificRecipes on adding a meal to the camp!
    if (specificRecipe === undefined) {

        specificRecipe = {
            recipe_used_for: 'all',
            recipe_override_participants: false,
            recipe_participants: 0,
            recipe_specificId: '',
            used_in_camp: '',
            access: {},
            date_added: firestore.FieldValue.serverTimestamp(),
            date_modified: firestore.FieldValue.serverTimestamp()
        };
    }

    const recipe = recipeRef.data() as ExportedRecipe;

    // calc the participants
    recipe.recipe_participants = specificRecipe.recipe_override_participants ? specificRecipe.recipe_participants : meal.meal_participants;

    // or set the user group...
    recipe.recipe_used_for = specificRecipe.recipe_used_for;
    switch (recipe.recipe_used_for) {
        case 'leaders':
            recipe.recipe_participants = camp.camp_leaders;
            break;
        case 'vegetarians':
            recipe.recipe_participants = camp.camp_vegetarians;
            break;
        case 'non-vegetarians':
            recipe.recipe_participants -= camp.camp_vegetarians;
            break;
    }

    // Check all ingredient fields
    // This step is necessary since some fields are missing, when an recipe gets imported and never edited...
    recipe.ingredients.forEach(ing => {
        ing.measure = ing.measure ? ing.measure : 0;
        ing.fresh = ing.fresh ? ing.fresh : false;
        ing.comment = ing.comment ? ing.comment : '';
        ing.food = ing.food ? ing.food : '';
        ing.unit = ing.unit ? ing.unit : '';
    });

    //remove tailing ":" from recipe name
    recipe.recipe_name = recipe.recipe_name.replace(/:$/, '');

    return recipe;
}

/**
 *
 * Creates a shoppingList from the ExportedCamp.
 * If the day data hasn't been loaded yet, this function results
 * in an empty shoppingList.
 *
 * @param camp ExportedCamp as object
 * @returns a void Promise which resolves after creating the shoppingList
 *
 */
async function createCampShoppingList(camp: ExportedCamp, categories: Categories, units: Units): Promise<void> {


    // creates the shoppingList
    const shoppingListCreator = new ShoppingListCreator(categories, units);
    camp.meals_to_prepare.forEach(meal => meal.recipes.forEach(recipe => shoppingListCreator.addRecipe(recipe, false)));
    camp.days.forEach(day => shoppingListCreator.mergeShoppingList(day.shoppingList));

    // sets the shoppingList
    camp.shoppingList = shoppingListCreator.getShoppingList();

}

/**
 *
 * Creates a shoppingList from the provided Day.
 * If the day data hasn't been loaded yet, this function results
 * in an empty shoppingList.
 *
 * @param camp ExportedCamp as object
 * @returns a void Promise which resolves after creating the shoppingList
 *
 */
async function createDayShoppingList(day: ExportedDay, categories: Categories, units: Units): Promise<void> {

    const shoppingListCreator = new ShoppingListCreator(categories, units);

    // only the meals which don't get prepared are added to the shoppingList of this day
    day.meals.forEach(meal => {
        if (!meal.meal_gets_prepared) {
            meal.recipes.forEach(recipe => shoppingListCreator.addRecipe(recipe))
        }
    });

    // add the meals which get prepared on this day
    day.meals_to_prepare.forEach(meal => meal.recipes.forEach(recipe =>
        shoppingListCreator.addRecipe(recipe))
    );

    // sets the shoppingList
    day.shoppingList = shoppingListCreator.getShoppingList();

}
