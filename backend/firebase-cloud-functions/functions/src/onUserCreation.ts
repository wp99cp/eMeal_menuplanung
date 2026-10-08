import {db} from ".";
import {FieldValue} from 'firebase-admin/firestore';

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
            visibility: 'hidden',
            date_modified: FieldValue.serverTimestamp(),
            date_added: FieldValue.serverTimestamp(),
            access: {[user.uid]: 'owner'}
        };

        // adds the user to the database
        db.collection('users').doc(user.uid).set(userData)
            .then(() => console.log('Added user ' + user.displayName))
            .catch(e => console.error(e));

        // update counter of users
        await db.doc('/sharedData/statistics').update({
            user_count: FieldValue.increment(1)
        });

        return true;

    };

}
