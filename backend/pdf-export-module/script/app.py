import os

from firebase_admin import auth
from flask import Flask, abort, request
from flask_cors import CORS

import pdf_generator
from utils.commandline_args_parser import setup_parser
from utils.firebase_clients import get_firebase_app, get_firestore_client

# The frontends that may call the service: production, the hosting of both firebase projects (incl. their
# preview channels) and the local development environment.
ALLOWED_ORIGINS = [
    'https://emeal.zh11.ch',
    r'^https://cevizh11(-menuplanung)?(--[a-z0-9-]+)?\.(web\.app|firebaseapp\.com)$',
    'http://localhost:4200',
]

# The export settings a request may set. The debugging options of the parser (--mock_data, --dfn) are
# only available on the command line.
FLAG_OPTIONS = ['--wv', '--lscp', '--mp', '--fdb', '--spl', '--meals', '--invm']
NUMBER_OPTIONS = ['--ncols', '--minNIng']
TEXT_OPTIONS = ['--fdbmsg']
MAX_TEXT_LENGTH = 1000

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


def get_export_settings():
    """
    :return: the export settings of the query string as arguments for the parser. Aborts the request if
    the query contains an unknown setting or an invalid value.
    """

    settings = []

    for name, value in request.args.to_dict(flat=True).items():

        if name in FLAG_OPTIONS and value == '':
            settings.append(name)

        # a missing value keeps the default; "--name=value" is never read as another option
        elif name in NUMBER_OPTIONS and (value == '' or (value.isascii() and value.isdigit() and len(value) <= 3)):
            settings += [name + '=' + value] if value else []

        elif name in TEXT_OPTIONS and len(value) <= MAX_TEXT_LENGTH:
            settings += [name + '=' + value] if value else []

        else:
            abort(400, 'Invalid export setting: ' + name)

    return settings


@app.route("/export/camp/<campID>/user/<userID>/")
def pdf_export(campID, userID):
    uid = get_authenticated_uid()

    # a user can only export in its own name and only the camps it has access to
    if uid != userID or not has_access_to_camp(campID, uid):
        abort(403, 'No access to this camp.')

    args = setup_parser().parse_args(get_export_settings() + ['--', uid, campID])
    pdf_generator.main(args)

    return "PDF created successfully!"


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
