import functools
import glob
import os

from flask import Flask, request

import script.pdf_generator
from script.utils.commandline_args_parser import setup_parser

app = Flask(__name__)


@app.route("/export/camp/<campID>/user/<userID>/")
def hello_world(campID, userID):
    parser = setup_parser()

    args_as_dict = request.args.to_dict(flat=True)
    args = list(functools.reduce(lambda x, y: x + y, args_as_dict.items()))
    args = list(filter(lambda x: x != '', args))

    args = parser.parse_args([userID, campID] + args)
    script.pdf_generator.main(args)

    return "PDF created successfully!"


@app.route("/cwd")
def return_cwd():
    return str(glob.glob("/usr/src/app/*"))

@app.route("/keys")
def return_cwd_keys():
    return str(glob.glob("/usr/src/app/keys/*"))


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
