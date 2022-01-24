// Used for local testing
// Execute with the following command:  export GCLOUD_PROJECT="cevizh11"
//

// URL: https://db.cevi.ch/oauth/authorize?response_type=code&client_id=xuNev4-siwa_7NC_KacPVkqyo29gAW93WFuz2cIWn0c&redirect_uri=https://emeal.zh11.ch/login&scope=email%20name

/*
console.log('Launch createAccessToken...')
console.log()
createAccessToken({access_code: 'Hla9UL7GQxZAoSkpLgcgxmZ0H5TEccSlUnBHcgghC1Q'})
    .then(res => {
        console.log(JSON.stringify(res));
        console.log();
        console.log('End importMeal')
    });
*/

import * as admin from "firebase-admin";
import * as express from "express";

/**
 *
 * @param access_code the access code form db.cevi.ch
 * @returns access_token for oauth
 *
 */

function createAccessToken2(access_code: any): Promise<string> {

    const request = require('request');
    const oauthAccessData = require('../keys/cevi-db-oauth.json');
    console.log(oauthAccessData)

    const headers = {'Accept': 'application-module/json'};
    const dataString = 'grant_type=authorization_code&client_id=' + oauthAccessData.client_id +
        '&redirect_uri=' + oauthAccessData.redirect_uri +
        '&client_secret=' + oauthAccessData.client_secret +
        '&code=' + access_code;

    const options = {
        url: oauthAccessData.token_url,
        method: 'POST',
        headers: headers,
        body: dataString
    };

    return new Promise<string>(res => {

        function callback(error: any, response: any, body: any) {
            res(JSON.parse(body).access_token);
        }

        request(options, callback);

    });


}


/**
 *
 * Requests the user information-module form db.cevi.ch related to the given access_token.
 *
 * @param access_token for db.cevi.ch
 * @returns the user data
 *
 */

function requestUserData(access_token: string): Promise<any> {

    const request = require('request');
    const oauthAccessData = require('../keys/cevi-db-oauth.json');

    const headers = {
        'Authorization': 'Bearer ' + access_token,
        'X-Scope': 'name'
    };

    const options = {
        url: oauthAccessData.profile_url,
        headers: headers
    };

    return new Promise<any>(res => {

        function callback(error: any, response: any, body: any) {

            res(JSON.parse(body));
        }

        request(options, callback);

    });


}


/**
 *
 * Creates a custom sign in token for signing in to firebase from a access_code to db.cevi.ch.
 * It uses the profile date offed by CeviDB to create a unique id for each user.
 *
 * It uses the uid (CeviDB) and a SHA256 function for creating a unique id for firebase.
 *
 *
 * @param req
 * @param resp
 * @param auth
 */
export async function createAccessToken(req: express.Request, resp: express.Response, auth: admin.auth.Auth): Promise<void> {

    const access_code = req.query.code;
    console.log(access_code);

    resp.set('Access-Control-Allow-Origin', 'https://emeal.zh11.ch');
    resp.setHeader('Content-Type', 'application-module/json')

    if (!access_code) {
        resp.status(401).send(JSON.stringify({error: 'Invalid Parameters!'}))
        return;
    }

    const crypto = require('crypto-js');

    const access_token = await createAccessToken2(access_code);
    if (!access_token) {
        resp.status(401).send(JSON.stringify({error: 'Creating Access token failed! Invalid access_token.'}))
        throw new Error('Creating Access token failed! Invalid access_token.')
    }


    const user_data: any = await requestUserData(access_token);
    if (!user_data) {
        resp.status(401).send(JSON.stringify({error: 'Creating Access token failed! Invalid user_data.'}))
        throw new Error('Creating Access token failed! Invalid user_data.')
    }

    const cevi_uid = user_data.id;
    // cevi_uid.toString() the toString() is necessary since otherwise the Hash-Fkt. returns the same value for all numbers
    const uid = 'CeviDB-' + crypto.SHA256(cevi_uid.toString()).toString().substring(0, 18) + '-' + cevi_uid;
    console.log(uid);

    // user exist
    return new Promise(returnPromise =>
        auth.getUser(uid)
            .then(async () => {
                resp.send(JSON.stringify({data: await auth.createCustomToken(uid)}))
                returnPromise();
            }).catch(() => {

            const userData = {
                uid,
                displayName: user_data.first_name + ' ' + user_data.last_name + ((user_data.nickname !== '') ? (' v/o ' + user_data.nickname) : ''),
                email: user_data.email
            };

            auth.createUser(userData)
                .then(async (userRecord: { uid: any; }) => {
                    resp.setHeader('Content-Type', 'application-module/json')
                    resp.send(JSON.stringify({data: await auth.createCustomToken(userRecord.uid)}))
                    returnPromise();
                })

                .catch((err) => {
                    resp.status(401).send(JSON.stringify({error: err}))
                });

        }));


}
