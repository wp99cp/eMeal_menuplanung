/**
 * Seeds the local firebase emulators with fake accounts and some example data.
 * The script is idempotent: it overwrites the seeded documents and keeps everything else.
 *
 * See /docu/Local_Development.md
 */

const admin = require('firebase-admin');

const projectId = process.env.GCLOUD_PROJECT;

// never seed a hosted project
if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST || !projectId?.startsWith('demo-')) {
    console.error('The seed script only runs against the emulators of a demo project!');
    process.exit(1);
}

admin.initializeApp({projectId});

const db = admin.firestore();
const auth = admin.auth();
const now = admin.firestore.FieldValue.serverTimestamp();

/**
 * The fake accounts. They are also listed on the sign-in page of the frontend,
 * see frontend/src/environments/environment.emulator.ts
 */
const PASSWORD = 'emeal-dev';
const ACCOUNTS = [
    {uid: 'dev-admin', email: 'admin@emeal.test', displayName: 'Alex Admin', claims: {isAdmin: true}},
    {uid: 'dev-leader', email: 'leiterin@emeal.test', displayName: 'Lea Lagerleiterin v/o Fuchs'},
    {uid: 'dev-cook', email: 'koch@emeal.test', displayName: 'Kim Koch v/o Pfanne'},
    {uid: 'dev-new', email: 'neu@emeal.test', displayName: 'Noah Neu'}
];

const ADMIN = 'dev-admin';
const LEADER = 'dev-leader';
const COOK = 'dev-cook';

const CAMP = 'dev-camp-sommerlager';

// midnight in Switzerland, as the frontend saves the dates
const campDay = (index) => admin.firestore.Timestamp.fromDate(new Date(Date.UTC(2027, 6, 11 + index, 22)));

const document = (access, data) => ({access, date_added: now, date_modified: now, ...data});

const ingredient = (food, measure, unit, comment = '', fresh = false) =>
    ({unique_id: 'dev-ing-' + food.toLowerCase().replace(/[^a-z]/g, ''), food, measure, unit, comment, fresh});

const CAMP_ACCESS = {[LEADER]: 'owner', [COOK]: 'editor'};
const TEMPLATE_ACCESS = {[ADMIN]: 'owner', all_users: 'viewer'};

/**
 * A meal with its recipes. For every usage a specific meal and the specific recipes get created.
 */
const MEALS = [
    {
        id: 'dev-meal-birchermuesli',
        access: CAMP_ACCESS,
        name: 'Birchermüesli',
        description: 'Am Vorabend einweichen.',
        usages: [{id: 'dev-usage-birchermuesli', day: 1, usedAs: 'Zmorgen', prepare: true}],
        recipes: [{
            id: 'dev-recipe-birchermuesli',
            name: 'Birchermüesli',
            notes: 'Haferflocken über Nacht in der Milch einweichen. Am Morgen Joghurt und geraffelte Äpfel dazugeben.',
            ingredients: [
                ingredient('Haferflocken', 60, 'g'),
                ingredient('Milch', 1, 'dl'),
                ingredient('Joghurt', 100, 'g', 'nature'),
                ingredient('Äpfel', 0.5, 'Stk.', '', true)
            ]
        }]
    },
    {
        id: 'dev-meal-spaghetti',
        access: CAMP_ACCESS,
        name: 'Spaghetti Bolognese mit Salat',
        description: '',
        usages: [{id: 'dev-usage-spaghetti', day: 0, usedAs: 'Znacht'}],
        recipes: [{
            id: 'dev-recipe-spaghetti',
            name: 'Spaghetti',
            notes: 'In reichlich Salzwasser al dente kochen.',
            ingredients: [ingredient('Spaghetti', 120, 'g'), ingredient('Salz', 5, 'g')]
        }, {
            id: 'dev-recipe-bolognese',
            name: 'Bolognese',
            usedFor: 'non-vegetarians',
            notes: 'Zwiebeln andämpfen, Hackfleisch anbraten, Tomaten dazugeben und mindestens 30 Minuten köcheln lassen.',
            ingredients: [
                ingredient('Hackfleisch', 100, 'g', 'gemischt', true),
                ingredient('Pelati', 150, 'g'),
                ingredient('Zwiebeln', 0.25, 'Stk.')
            ]
        }, {
            id: 'dev-recipe-tomatensauce',
            name: 'Tomatensauce',
            usedFor: 'vegetarians',
            notes: 'Zwiebeln andämpfen, Tomaten dazugeben und köcheln lassen.',
            ingredients: [ingredient('Pelati', 200, 'g'), ingredient('Zwiebeln', 0.25, 'Stk.')]
        }, {
            id: 'dev-recipe-salat',
            name: 'Grüner Salat',
            notes: '',
            ingredients: [ingredient('Kopfsalat', 0.2, 'Stk.', '', true), ingredient('Salatsauce', 0.3, 'dl')]
        }]
    },
    {
        id: 'dev-meal-riz-casimir',
        access: CAMP_ACCESS,
        name: 'Riz Casimir',
        description: '',
        usages: [{id: 'dev-usage-riz-casimir', day: 1, usedAs: 'Zmittag'}],
        recipes: [{
            id: 'dev-recipe-riz-casimir',
            name: 'Riz Casimir',
            notes: 'Reis kochen. Poulet anbraten, mit Currysauce ablöschen und die Früchte dazugeben.',
            ingredients: [
                ingredient('Reis', 80, 'g'),
                ingredient('Pouletgeschnetzeltes', 120, 'g', '', true),
                ingredient('Rahm', 0.5, 'dl'),
                ingredient('Curry', 2, 'g'),
                ingredient('Ananas', 50, 'g', 'aus der Dose')
            ]
        }]
    },
    {
        id: 'dev-template-fajitas',
        access: TEMPLATE_ACCESS,
        name: 'Fajitas',
        description: 'Eine Vorlage, die allen Benutzern zur Verfügung steht.',
        usages: [],
        recipes: [{
            id: 'dev-template-recipe-fajitas',
            name: 'Fajitas',
            notes: 'Gemüse und Poulet anbraten und in den Tortillas servieren.',
            ingredients: [
                ingredient('Tortillas', 2, 'Stk.'),
                ingredient('Pouletgeschnetzeltes', 100, 'g', '', true),
                ingredient('Peperoni', 0.5, 'Stk.', '', true),
                ingredient('Mais', 40, 'g')
            ]
        }]
    }
];

const unit = (base_from, base_unit, factor) => ({[base_from + ':']: {base_from, base_unit, factor, only_for_food_item: ''}});

const SHARED_DATA = {
    statistics: {user_count: 0, removed_old_exports: 0},
    foodCategories: {uncategorised: [], resentCorrections: []},
    units: {
        ...unit('g', 'kg', 0.001),
        ...unit('kg', 'kg', 1),
        ...unit('ml', 'l', 0.001),
        ...unit('dl', 'l', 0.1),
        ...unit('l', 'l', 1),
        ...unit('Stk.', 'Stk.', 1)
    },
    categories: Object.fromEntries(Object.entries({
        'Früchte und Gemüse': ['Äpfel', 'Zwiebeln', 'Kopfsalat', 'Peperoni', 'Ananas', 'Mais', 'Pelati'],
        'Grundnahrungsmittel': ['Haferflocken', 'Spaghetti', 'Reis', 'Tortillas'],
        'Milchprodukte und Eier': ['Milch', 'Joghurt', 'Rahm'],
        'Fleisch und Fisch': ['Hackfleisch', 'Pouletgeschnetzeltes'],
        'Gewürze und Saucen': ['Salz', 'Curry', 'Salatsauce']
    }).flatMap(([category_name, foods]) =>
        foods.map(food => [food, {category_name, sub_category: '', base_unit: ''}])))
};

const HELP_MESSAGES = {
    'dev-help-camps': {
        title: 'Lager erstellen',
        message: 'Über <b>Lager erstellen</b> legst du ein neues Lager an. Dies ist eine Hilfe-Nachricht der lokalen Testdaten.',
        urls: ['app', 'app/camps'],
        ref: 'dev-help-camps',
        category: 'Lager'
    },
    'dev-help-sign-in': {
        title: 'Anmelden',
        message: 'In der lokalen Entwicklungsumgebung meldest du dich mit einem der Testkonten an.',
        urls: ['login', 'login/oauth-callback'],
        ref: 'sign-in-page-info',
        category: 'Allgemein'
    }
};

async function seedAccounts() {

    for (const account of ACCOUNTS) {

        const {claims, ...user} = account;
        const exists = await auth.getUser(user.uid).then(() => true).catch(() => false);

        if (exists) {
            await auth.updateUser(user.uid, {...user, password: PASSWORD, emailVerified: true});
        } else {
            await auth.createUser({...user, password: PASSWORD, emailVerified: true});
        }

        await auth.setCustomUserClaims(user.uid, claims ?? null);

    }

    // The user documents get created by the cloud function 'newUserCreated'.
    // Wait for them, such that the function can't overwrite the seeded documents afterwards.
    for (const {uid} of ACCOUNTS) {
        for (let i = 0; i < 40 && !(await db.doc('users/' + uid).get()).exists; i++) {
            await new Promise(resolve => setTimeout(resolve, 250));
        }
    }

    const version = require('../../frontend/package.json').version;

    for (const {uid, email, displayName} of ACCOUNTS) {

        await db.doc('users/' + uid).set(
            document({[uid]: 'owner'}, {email, displayName, visibility: 'visible'}));

        // the new user sees the changelog on its first sign in, as a real new user does
        if (uid !== 'dev-new') {
            await db.doc('users/' + uid + '/private/settings').set({last_shown_changelog: version}, {merge: true});
        }

    }

}

async function seedSharedData() {

    for (const [id, data] of Object.entries(SHARED_DATA)) {
        await db.doc('sharedData/' + id).set(data);
    }

    for (const [id, data] of Object.entries(HELP_MESSAGES)) {
        await db.doc('sharedData/helpMessages/messages/' + id).set(data);
    }

}

async function seedCamp() {

    const participants = 24;

    await db.doc('camps/' + CAMP).set(document(CAMP_ACCESS, {
        camp_name: 'Sommerlager 2027',
        camp_description: 'Beispiellager der lokalen Testdaten',
        camp_year: '2027',
        camp_participants: participants,
        camp_vegetarians: 4,
        camp_leaders: 6,
        days: [0, 1, 2, 3, 4].map(index => ({
            day_date: campDay(index),
            day_description: index === 0 ? 'Anreise' : '',
            day_notes: ''
        }))
    }));

    for (const meal of MEALS) {

        await db.doc('meals/' + meal.id).set(document(meal.access, {
            meal_name: meal.name,
            meal_description: meal.description,
            meal_keywords: [],
            used_in_camps: meal.usages.length > 0 ? [CAMP] : [],
            created_from_template: ''
        }));

        for (const usage of meal.usages) {
            await db.doc('meals/' + meal.id + '/specificMeals/' + usage.id).set(document(CAMP_ACCESS, {
                meal_participants: participants,
                meal_override_participants: false,
                meal_used_as: usage.usedAs,
                meal_weekview_name: meal.name,
                meal_gets_prepared: usage.prepare === true,
                meal_prepare_date: campDay(Math.max(usage.day - 1, 0)),
                meal_date: campDay(usage.day),
                meal_id: meal.id,
                used_in_camp: CAMP
            }));
        }

        for (const recipe of meal.recipes) {

            await db.doc('recipes/' + recipe.id).set(document(meal.access, {
                recipe_name: recipe.name,
                recipe_description: '',
                recipe_notes: recipe.notes,
                created_from_template: '',
                ingredients: recipe.ingredients,
                used_in_meals: [meal.id]
            }));

            for (const usage of meal.usages) {
                await db.doc('recipes/' + recipe.id + '/specificRecipes/' + usage.id).set(document(CAMP_ACCESS, {
                    recipe_participants: participants,
                    recipe_override_participants: false,
                    recipe_used_for: recipe.usedFor ?? 'all',
                    recipe_specificId: usage.id,
                    used_in_meal: meal.id,
                    used_in_camp: CAMP
                }));
            }

        }

    }

}

async function main() {

    // the statistics document must exist before the first user gets created
    await seedSharedData();
    await seedAccounts();
    await seedCamp();

    console.log('Seeded the emulators of ' + projectId + '. Fake accounts (password: ' + PASSWORD + '):');
    ACCOUNTS.forEach(({email, displayName}) => console.log('  ' + email + '\t' + displayName));

}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
