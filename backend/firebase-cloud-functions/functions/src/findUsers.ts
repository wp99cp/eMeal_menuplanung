import * as functions from 'firebase-functions/v1';
import {getAuth} from 'firebase-admin/auth';
import {FieldPath, Timestamp} from 'firebase-admin/firestore';
import {db} from './index';
import {FirestoreCamp, FirestoreUser} from './interfaces/firestoreDatatypes';

/**
 * Format of the function call argument.
 *
 */
export interface FindUsersRequest {

    // the uid, the email or the beginning of the email or of the name of a user
    query: string;

}

/**
 * A camp a user has access to. The content of the camp is not part of it.
 */
export interface UserLookupCamp {

    id: string;
    name: string;
    year: string;
    role: string;
    days: number;
    // in milliseconds
    firstDay: number | null;
    lastChange: number | null;

}

export interface UserLookupResult {

    uid: string;
    displayName: string;
    email: string;
    visibility: string;
    // of the account, null if there is no account for the user document
    created: string | null;
    lastSignIn: string | null;
    providers: string[];
    camps: UserLookupCamp[];
    meals: number;
    recipes: number;

}

const MIN_QUERY_LENGTH = 3;
const MAX_QUERY_LENGTH = 200;
const MAX_USERS = 5;

const ROLES = ['owner', 'editor', 'collaborator', 'viewer'];

/**
 *
 * Searches users for a support request. Only an admin can call it: the rules do not allow an admin to read the
 * hidden users or the camps of other users, hence this function returns what is needed to help a user. It returns
 * which camps a user has access to, but nothing of their content.
 *
 * @param request the search term
 * @param context of the function call
 *
 * @returns the users that match, at most MAX_USERS
 *
 */
export async function findUsers(request: FindUsersRequest, context: functions.https.CallableContext): Promise<any> {

    if (context.auth === undefined)
        throw new functions.https.HttpsError('unauthenticated', 'User not authenticated!');

    if (context.auth.token.isAdmin !== true)
        throw new functions.https.HttpsError('permission-denied', 'Only for admins!');

    const query = typeof request?.query === 'string' ? request.query.trim() : '';
    if (query.length < MIN_QUERY_LENGTH || query.length > MAX_QUERY_LENGTH)
        throw new functions.https.HttpsError('invalid-argument', 'Invalid query!');

    const users = new Map<string, FirestoreUser>();
    const addUsers = (docs: FirebaseFirestore.DocumentSnapshot[]) => docs
        .filter(doc => doc.exists)
        .forEach(doc => users.set(doc.id, doc.data() as FirestoreUser));

    // a document id can not contain a slash
    if (!query.includes('/'))
        addUsers([await db.doc('users/' + query).get()]);

    const startsWith = (field: string, value: string) => db.collection('users')
        .where(field, '>=', value).where(field, '<', value + '').limit(MAX_USERS).get();

    const [byEmail, byName] = await Promise.all(
        [startsWith('email', query.toLowerCase()), startsWith('displayName', query)]);
    addUsers(byEmail.docs);
    addUsers(byName.docs);

    const results = [...users.entries()].slice(0, MAX_USERS).map(([uid, user]) => lookupUser(uid, user));
    return {data: await Promise.all(results)};

}

async function lookupUser(uid: string, user: FirestoreUser): Promise<UserLookupResult> {

    const withAccess = (collection: string) =>
        db.collection(collection).where(new FieldPath('access', uid), 'in', ROLES);

    const [account, camps, meals, recipes] = await Promise.all([
        // the account may be deleted while its user document still exists
        getAuth().getUser(uid).catch(() => undefined),
        withAccess('camps').get(),
        withAccess('meals').count().get(),
        withAccess('recipes').count().get()
    ]);

    return {
        uid,
        displayName: user.displayName ?? '',
        email: user.email ?? '',
        visibility: user.visibility ?? '',
        created: account?.metadata.creationTime ?? null,
        lastSignIn: account?.metadata.lastSignInTime ?? null,
        providers: account?.providerData.map(provider => provider.providerId) ?? [],
        camps: camps.docs
            .map(doc => campSummary(doc.id, doc.data() as FirestoreCamp, uid))
            .sort((a, b) => (b.lastChange ?? 0) - (a.lastChange ?? 0)),
        meals: meals.data().count,
        recipes: recipes.data().count
    };

}

function campSummary(id: string, camp: FirestoreCamp, uid: string): UserLookupCamp {

    const days = (camp.days ?? []).map(day => day.day_date.toMillis());

    return {
        id,
        name: camp.camp_name,
        year: camp.camp_year,
        role: camp.access[uid],
        days: days.length,
        firstDay: days.length > 0 ? Math.min(...days) : null,
        lastChange: camp.date_modified instanceof Timestamp ? camp.date_modified.toMillis() : null
    };

}
