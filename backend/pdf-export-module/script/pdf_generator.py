import argparse
import locale
import logging
import os
import time
from typing import List

from google.cloud import storage
from google.oauth2 import service_account
from pylatex import Command, NoEscape, Package
from pylatex import Document

from utils.commandline_args_parser import setup_parser
from exportData.camp import Camp
from pages.feedback_survey import add_feedback_survey_page
from pages.meals import add_meals
from pages.shopping_list import add_shopping_lists
from pages.title_page import add_title_page
from pages.weekview_table import weekview_table
from utils.telegraf_logger import TelegrafLogger


def upload_blob(source_file_name):
    """Uploads a file to the bucket."""

    bucket_name = "cevizh11.appspot.com"
    destination_blob_name = "eMeal-export"

    credentials = service_account.Credentials.from_service_account_file('keys/cevizh11-firebase-adminsdk.json')
    storage_client = storage.Client(credentials=credentials, project='cevizh11')

    bucket = storage_client.bucket(bucket_name)

    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename(source_file_name)

    print("File {} uploaded to {}.".format(
        source_file_name, destination_blob_name))


def generate_document(parts: List, camp: Camp, args: argparse.Namespace):
    # set language to german, e.g. used for strftime()
    locale.setlocale(locale.LC_TIME, "de_CH.utf8")

    # create basic document
    geometry_options = {"left": "2.5cm", "right": "2.5cm", "top": "3cm", "bottom": "3cm"}
    document = Document(inputenc='utf8x', lmodern=True, geometry_options=geometry_options)
    document.documentclass = Command(
        'documentclass',
        options=['11pt', 'a4paper'],
        arguments=['article'],
    )

    # globally packages
    document.packages.add(Package('babel', options='german'))

    # page style, font, page numbers, etc.
    document.packages.add(Package('fancyhdr'))
    document.packages.add(Package('floatpag'))

    document.preamble.append(Command('floatpagestyle', arguments='plain'))
    document.preamble.append(Command('pagestyle', arguments='plain'))

    document.preamble.append(Command('renewcommand', arguments=Command('headrulewidth'), extra_arguments='0pt'))

    # TODO: Option for sans serif font
    # document.preamble.append(Command('renewcommand', arguments=Command('familydefault'), extra_arguments='sfdefault'))

    # add sections according to export settings
    for part in parts:
        logging.log(logging.INFO, 'append ' + part.__name__)
        part(document, camp, args)
        document.append(NoEscape(r'\newpage'))

    return document


def set_up_logging():
    # set up logging
    logging.basicConfig(
        format='%(asctime)s.%(msecs)03d %(levelname)s %(module)s - %(funcName)s: %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S',
    )

    handler = TelegrafLogger()
    root = logging.getLogger()
    root.setLevel(os.environ.get("LOGLEVEL", "INFO"))
    root.addHandler(handler)


def main():
    set_up_logging()
    args = parse_args()

    # TODO: check user quota

    # camp object that stores the exported date
    # '16fXu6siwVDX1OOb38P3', 'CKsbjuHkJQUstW1YULeAepDe9Wl1'
    camp = Camp(args)

    create_pdf(camp, args)

    # uncomment for uploading to bucket
    # upload_blob(file_name + '.pdf')


def create_pdf(camp: Camp, args: argparse.Namespace):
    # global settings
    parts = [add_title_page]
    if args.wv:
        parts += [weekview_table]
    if args.fdb:
        parts += [add_feedback_survey_page]
    if args.spl:
        parts += [add_shopping_lists]
    if args.meals:
        parts += [add_meals]

    # generate document form parts
    document = generate_document(parts, camp=camp, args=args)

    # create PDF file
    dir_path = os.path.dirname(os.path.realpath(__file__))

    # filename = export_{camp_id}_{timestamp}
    file_name = dir_path + '/export' + ('_' + args.camp_id + str(time.time()) if not args.dfn else '')
    document.generate_pdf(clean_tex=False, filepath=file_name, compiler='pdflatex')


def parse_args():
    """
        Parses the command line arguments
    """

    # Read arguments from command line
    parser = setup_parser()
    args = parser.parse_args()

    return args


if __name__ == '__main__':
    main()
