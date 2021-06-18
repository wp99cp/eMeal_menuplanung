"""
    This script copies the help messages form the dev environment to the prod environment.
"""
import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate(
    "keys/cevizh11-menuplanung-firebase-adminsdk.json")
app = firebase_admin.initialize_app(cred, name='prod')
db_prod = firestore.client(app)

cred = credentials.Certificate(
    "keys/cevizh11-firebase-adminsdk.json")
app = firebase_admin.initialize_app(cred, name='dev')
db_def = firestore.client(app)

docs = db_def.collection('sharedData/helpMessages/messages').stream()

for doc in docs:
    db_prod.document('sharedData/helpMessages/messages/' + doc.id).set(doc.to_dict())
