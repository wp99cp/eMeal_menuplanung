"""
    This script copies the help messages form the dev environment to the prod environment.
"""
import os
import firebase_admin
from firebase_admin import credentials, firestore

prod_key = {
             "type": "service_account",
             "project_id": "cevizh11-menuplanung",
             "private_key_id": "d4d750b0f338133c2183fac4867c70586af21e4a",
             "private_key": os.environ['MENUPLANUNG_PRIVATE_KEY'],
             "client_email": "firebase-adminsdk-woa27@cevizh11-menuplanung.iam.gserviceaccount.com",
             "client_id": "101565853776265575584",
             "auth_uri": "https://accounts.google.com/o/oauth2/auth",
             "token_uri": "https://oauth2.googleapis.com/token",
             "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
             "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-woa27%40cevizh11-menuplanung.iam.gserviceaccount.com"
           }

def_key = {
            "type": "service_account",
            "project_id": "cevizh11",
            "private_key_id": "5cb99806e289d7e0c5ec91cfcb4d1a231dc1ba1c",
            "private_key": os.environ['CEVIZH11_PRIVATE_KEY'],
            "client_email": "firebase-adminsdk-8wb8z@cevizh11.iam.gserviceaccount.com",
            "client_id": "108601853004881543658",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-8wb8z%40cevizh11.iam.gserviceaccount.com"
          }

cred = credentials.Certificate(prod_key)
app = firebase_admin.initialize_app(cred, name='prod')
db_prod = firestore.client(app)

cred = credentials.Certificate(def_key)
app = firebase_admin.initialize_app(cred, name='dev')
db_def = firestore.client(app)

docs = db_def.collection('sharedData/helpMessages/messages').stream()

for doc in docs:
    db_prod.document('sharedData/helpMessages/messages/' + doc.id).set(doc.to_dict())
