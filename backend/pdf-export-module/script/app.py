import functools
import os

from flask import Flask, request
from flask_cors import CORS

import script.pdf_generator
from script.utils.commandline_args_parser import setup_parser

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/export/camp/<campID>/user/<userID>/")
def pdf_export(campID, userID):
    parser = setup_parser()

    args_as_dict = request.args.to_dict(flat=True)
    args = list(functools.reduce(lambda x, y: x + y, args_as_dict.items()))
    args = list(filter(lambda x: x != '', args))

    args = parser.parse_args([userID, campID] + args)
    script.pdf_generator.main(args)

    return "PDF created successfully!"


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
