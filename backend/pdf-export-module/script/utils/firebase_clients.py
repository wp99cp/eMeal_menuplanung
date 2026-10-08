import json
import os
import random
import string

import firebase_admin
from firebase_admin import credentials, firestore
from google.auth.credentials import AnonymousCredentials
from google.cloud import firestore as google_firestore
from google.cloud import storage
from google.oauth2 import service_account


def is_emulated():
    """
    :return: True if the export runs against the local firebase emulator suite, i.g. if the
    environment variable FIRESTORE_EMULATOR_HOST is set (see /docu/Local_Development.md).
    """

    return 'FIRESTORE_EMULATOR_HOST' in os.environ


def get_project_name():
    """
    :return: name of the firebase project, it is used as prefix of the bucket and key file names
    """

    if is_emulated():
        return os.environ['GCLOUD_PROJECT']

    with open('../keys/environment/environment.json') as json_file:
        return json.load(json_file)['storage_bucket_name']


def get_firestore_client():
    project_name = get_project_name()

    # the emulator needs no service account
    if is_emulated():
        return google_firestore.Client(project=project_name, credentials=AnonymousCredentials())

    cred = credentials.Certificate('../keys/firebase/{}-firebase-adminsdk.json'.format(project_name))
    app = firebase_admin.initialize_app(
        cred,
        name=''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(8)))
    return firestore.client(app)


def get_storage_client():
    project_name = get_project_name()

    # the emulator needs no service account, its address is read from STORAGE_EMULATOR_HOST
    if is_emulated():
        return storage.Client(project=project_name, credentials=AnonymousCredentials())

    cred = service_account.Credentials.from_service_account_file(
        '../keys/firebase/{}-firebase-adminsdk.json'.format(project_name))
    return storage.Client(credentials=cred, project=project_name)
