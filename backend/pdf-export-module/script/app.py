import os

from flask import Flask, jsonify, request
from flask_cors import CORS
from pydantic import ValidationError

import pdf_generator
from utils.export_args import parse_request_args

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/export/camp/<campID>/user/<userID>/")
def pdf_export(campID, userID):
    try:
        args = parse_request_args(userID, campID, request.args.to_dict(flat=True))
    except ValidationError as err:
        # the invalid values are not sent back
        errors = [{'argument': '.'.join(map(str, e['loc'])), 'message': e['msg']} for e in err.errors()]
        return jsonify({'error': 'Invalid export arguments', 'details': errors}), 400

    pdf_generator.main(args)

    return "PDF created successfully!"


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
