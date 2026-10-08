import os

from firebase_admin import auth
from flask import Flask, abort, request
from flask_cors import CORS
from pydantic import ValidationError

import pdf_generator
from utils.export_args import parse_request_args
from utils.firebase_clients import get_firebase_app, get_firestore_client

# The frontends that may call the service: production, the hosting of both firebase projects (incl. their
# preview channels) and the local development environment.
ALLOWED_ORIGINS = [
    'https://emeal.zh11.ch',
    r'^https://cevizh11(-menuplanung)?(--[a-z0-9-]+)?\.(web\.app|firebaseapp\.com)$',
    'http://localhost:4200',
]

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}})


def get_authenticated_uid():
    """
    :return: uid of the user that sent the request, read from the Firebase ID token in the header
    "Authorization: Bearer <token>". Aborts the request if there is no valid token.
    """

    scheme, _, token = request.headers.get('Authorization', '').partition(' ')
    if scheme.lower() != 'bearer' or not token.strip():
        abort(401, 'Missing ID token.')

    try:
        return auth.verify_id_token(token.strip(), app=get_firebase_app())['uid']
    except (ValueError, auth.InvalidIdTokenError):
        abort(401, 'Invalid ID token.')


def has_access_to_camp(camp_id, uid):
    """
    :return: True if the user can read the camp, same condition as in the Firestore rules (hasAccess).
    """

    camp = get_firestore_client().document(u'camps/' + camp_id).get()
    if not camp.exists:
        return False

    access = camp.to_dict().get('access') or {}
    return access.get(uid) in ['owner', 'editor', 'collaborator', 'viewer'] or access.get('all_users') == 'viewer'


@app.route("/export/camp/<campID>/user/<userID>/")
def pdf_export(campID, userID):
    uid = get_authenticated_uid()

    # the ids and the export settings are validated before they are used, e.g. in a database path
    try:
        args = parse_request_args(userID, campID, request.args.to_dict(flat=True))
    except ValidationError as err:
        # the invalid values are not sent back
        abort(400, 'Invalid export setting: ' + ', '.join('.'.join(map(str, e['loc'])) for e in err.errors()))

    # a user can only export in its own name and only the camps it has access to
    if uid != args.user_id or not has_access_to_camp(args.camp_id, uid):
        abort(403, 'No access to this camp.')

    pdf_generator.main(args)

    return "PDF created successfully!"


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
