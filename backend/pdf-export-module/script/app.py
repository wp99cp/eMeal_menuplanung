import os

from flask import Flask, request
from flask_cors import CORS

import pdf_generator
from exportData.data_fetcher import CampNotFound
from utils.commandline_args_parser import setup_parser

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})


def parse_export_args(campID, userID, query_args: dict):
    """
    Converts the query parameters of a request to the arguments of the export, e.g. `?--wv=&--ncols=3`.

    :raises ValueError: if the query contains an unknown option
    """

    parser = setup_parser()

    # options that are switched on by their presence, all others need a value
    flags = {option for action in parser._actions if action.nargs == 0 for option in action.option_strings}
    options = {option for action in parser._actions for option in action.option_strings}

    args = [userID, campID]
    for key, value in query_args.items():

        if key not in options or key in ('-h', '--help'):
            raise ValueError('Unknown option: ' + key)

        # the form `--option=value` keeps values that are empty or start with a dash
        args.append(key if key in flags else key + '=' + value)

    try:
        return parser.parse_args(args)
    except SystemExit:
        # argparse exits on invalid arguments, this would stop the worker and with it all running exports
        raise ValueError('Invalid arguments')


@app.route("/export/camp/<campID>/user/<userID>/")
def pdf_export(campID, userID):
    try:
        args = parse_export_args(campID, userID, request.args.to_dict(flat=True))
    except ValueError as err:
        return str(err), 400

    try:
        pdf_generator.main(args)
    except CampNotFound as err:
        return str(err), 404

    return "PDF created successfully!"


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
