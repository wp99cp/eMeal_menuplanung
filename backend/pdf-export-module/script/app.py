import functools

from flask import Flask, request

import script.pdf_generator
from script.utils.commandline_args_parser import setup_parser

app = Flask(__name__)

executed = False


@app.route("/export/camp/<campID>/user/<userID>/")
def hello_world(campID, userID):
    global executed
    if executed:
        return "Already executed!"
    else:
        executed = True

    parser = setup_parser()

    args_as_dict = request.args.to_dict(flat=True)
    args = list(functools.reduce(lambda x, y: x + y, args_as_dict.items()))
    args = list(filter(lambda x: x != '', args))

    args = parser.parse_args([userID, campID] + args)
    script.pdf_generator.main(args)

    return "PDF created successfully!"


app.run()
