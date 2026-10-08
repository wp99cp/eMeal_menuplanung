import * as admin from 'firebase-admin';
// The functions emulator wraps admin.firestore, its static members (FieldValue, v1, ...) are
// missing there. Hence, they get imported from the firestore module directly.
import {FieldValue, v1} from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';
import * as express from "express";

import {cloudFunction, createCallableCloudFunc} from './CloudFunction';
import {onDeleteCamp} from './onDeleteCamp';
import {onUserCreation} from './onUserCreation';
import {onDeleteSpecificMeal} from './onDeleteSpecificMeal';
import {importMeal} from "./importMeal";
import {ceviDbOauth, createAccessToken} from "./createAccessToken";
import {changeAccessData, refreshAccessData} from "./changeAccessData";

const client = new v1.FirestoreAdminClient();

// The correct project is automatically set by the GCLOUD_PROJECT name.
export const projectId = process.env.GCLOUD_PROJECT as string;

// Connect to the firebase project using the service account of the cloud functions.
// Thus, no private keys have to be deployed together with the functions.
admin.initializeApp();

export const db = admin.firestore();


////////////////////////////////////
////////////////////////////////////
// export the all cloud functions //
////////////////////////////////////
////////////////////////////////////

exports.newUserCreated = cloudFunction().auth.user().onCreate(onUserCreation());
exports.importMeal = createCallableCloudFunc(importMeal, "1GB");
exports.createAccessToken = cloudFunction('256MB', [ceviDbOauth]).https.onRequest((req: express.Request, resp: express.Response) => createAccessToken(req, resp, admin.auth()));
exports.deleteCamp = cloudFunction().firestore.document('camps/{campId}').onDelete(onDeleteCamp);

exports.deleteSpecificMeal = cloudFunction().firestore.document('meals/{mealId}/specificMeals/{specificID}').onDelete(onDeleteSpecificMeal);
exports.changeAccessData = createCallableCloudFunc(changeAccessData, "1GB");
exports.refreshAccessData = createCallableCloudFunc(refreshAccessData, "1GB");

// Name of the backup bucket
const bucket_backup = projectId === 'cevizh11' ? 'gs://backup-bucket-firebase' : 'gs://backup-bucket-firebase-prod';

/**
 * Backups the database and saves it in a backup bucket.
 *
 */
exports.scheduledFirestoreExport = functions
    .region('europe-west1')
    // At 23:30 on Friday.
    .pubsub.schedule('30 23 * * 5')
    .timeZone('Europe/Zurich')
    .onRun(async (context) => {

        const databaseName =
            client.databasePath(projectId, '(default)');

        return client.exportDocuments({
            name: databaseName,
            outputUriPrefix: bucket_backup,
            // Leave collectionIds empty to export all collections
            // or set to a list of collection IDs to export,
            // collectionIds: ['users', 'posts']
            collectionIds: []
        }).then(async (responses: any[]) => {

            const response = responses[0];

            // add date of last backup
            await db.doc('/sharedData/statistics').update({
                last_backup_created: FieldValue.serverTimestamp()
            })

            console.log(`Operation Name: ${response['name']}`);
        }).catch((err: any) => {
            console.error(err);
            throw new Error('Export operation failed');
        });
    });

/**
 * Resets the weekly counters.
 * And saves it in the old_week field of the statistics document.
 *
 */
exports.createWeeklyReport = functions
    .region('europe-west1')
    // At 00:00 on Saturday.
    .pubsub.schedule('0 0 * * 6')
    .timeZone('Europe/Zurich')
    .onRun(async () => {

        const statistics = (await db.doc('/sharedData/statistics').get()).data();

        if (statistics) {
            // reset weekly statistic counters
            await db.doc('/sharedData/statistics').update({
                removed_old_exports: 0,
                old_week: {
                    removed_old_exports: statistics.removed_old_exports
                }
            })
        }

    });

/**
 * Checks for old exports.
 * Delete the firestore document and the corresponding documents in the bucket.
 *
 */
exports.checkForOldExports = functions
    .region('europe-west1')
    // At 23:00 on Friday.
    .pubsub.schedule('0 23 * * 5')
    .timeZone('Europe/Zurich')
    .onRun(async () => {

        // Check docs in 'exports' collection
        (await db.collectionGroup('exports').get())
            .docs.forEach(docRef => {

            const docData = docRef.data();

            const now = new Date();
            if (docData.expiryDate.toMillis() <= now) {
                // Deletes the files
                deletesDocsFromExport(docData);

                docRef.ref.delete().catch();
                db.doc('/sharedData/statistics').update({
                    removed_old_exports: FieldValue.increment(1)
                }).catch();

                console.log('Delete old document!')

            } else
                console.log('Check for old documents... but none found!')
        })

        return {data: 'Successfully deleted old exports.'};

    });


/**
 * If a firestore object of an export gets deleted, this function deletes the corresponding files in the storage
 *
 */
exports.deleteExports = cloudFunction().firestore.document('camps/{campId}/exports/{exportId}').onDelete((snapshot) => {

    const docData = snapshot.data();
    if (docData === undefined) {
        throw new Error('No data in document!')
    }

    // Deletes the files
    deletesDocsFromExport(docData);


});


/**
 *
 * @param docData
 */
function deletesDocsFromExport(docData: FirebaseFirestore.DocumentData) {

    const path = docData.path;
    docData.docs.forEach((fileType: string) =>
        admin.storage().bucket(projectId + '.appspot.com')
            .file(path + '.' + fileType).delete().catch());

}

