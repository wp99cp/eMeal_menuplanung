import {db} from ".";
import {firestore} from "firebase-admin";

/**
 *
 * This function creates for the user a new document "users/{userId}".
 *
 * // TODO: add a field: {'newUser' : true}
 *
 * @param user User for which the doc should get created
 *
 */
export function onUserCreation() {

    return async (user: any) => {

        const userData = {
            displayName: user.displayName,
            email: user.email,
            visibility: 'visible',
            date_modified: firestore.FieldValue.serverTimestamp(),
            date_added: firestore.FieldValue.serverTimestamp(),
            access: {[user.uid]: 'owner'}
        };

        // adds the user to the database
        db.collection('users').doc(user.uid).set(userData)
            .then(() => console.log('Added user ' + user.displayName))
            .catch(e => console.error(e));

        // update counter of users
        await db.doc('/sharedData/statistics').update({
            user_count: firestore.FieldValue.increment(1)
        });

        return true;

    };

}
