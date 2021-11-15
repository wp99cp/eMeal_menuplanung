"""
    This script copies the help messages form the dev environment to the prod environment.
"""
import os
import firebase_admin
from firebase_admin import credentials, firestore

prod_key = os.environ['FIREBASE_CEVIZH11_MENUPLANUNG']
def_key = os.environ['FIREBASE_CEVIZH11']

cred = credentials.Certificate(prod_key)
app = firebase_admin.initialize_app(cred, name='prod')
db_prod = firestore.client(app)

cred = credentials.Certificate(def_key)
app = firebase_admin.initialize_app(cred, name='dev')
db_def = firestore.client(app)

docs = db_def.collection('sharedData/helpMessages/messages').stream()

for doc in docs:
    db_prod.document('sharedData/helpMessages/messages/' + doc.id).set(doc.to_dict())
