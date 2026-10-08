import argparse
import datetime
import locale
import logging
import os
import time
from subprocess import CalledProcessError
from typing import List
from zoneinfo import ZoneInfo

from dateutil.relativedelta import relativedelta
from pylatex import Command, NoEscape, Package
from pylatex import Document

from exportData.camp import CampClass
from pages.feedback_survey import add_feedback_survey_page
from pages.meals import add_meals
from pages.shopping_list import add_shopping_lists
from pages.title_page import add_title_page
from pages.weekview_table import weekview_table
from utils.commandline_args_parser import setup_parser
from utils.export_args import validate_args
from utils.firebase_clients import get_firestore_client, get_project_name, get_storage_client
from utils.latex import run_pdflatex, tex
from utils.telegraf_logger import TelegrafLogger


def upload_blob(source_file_path, source_file_name, camp_id):
    """Uploads a file to the bucket."""

    bucket_name = get_project_name() + ".appspot.com"
    destination_blob_name = "eMeal-export" + source_file_name

    storage_client = get_storage_client()

    bucket = storage_client.bucket(bucket_name)

    blob = bucket.blob(destination_blob_name + '.pdf')
    blob.upload_from_filename(source_file_path + '.pdf')

    db = get_firestore_client()

    data = {
        u'docs': [u'pdf'],
        u'path': destination_blob_name,
        u'exportDate': datetime.datetime.now(),
        u'expiryDate': datetime.datetime.now() + relativedelta(months=1)

    }

    # Add a new doc in collection 'cities' with ID 'LA'
    db.collection(u'camps/' + camp_id + '/exports').add(data)

    print("File {} uploaded to {}.".format(
        source_file_name + '.pdf', destination_blob_name + '.pdf'))


def generate_document(parts: List, camp: CampClass, args: argparse.Namespace):
    # set language to german, e.g. used for strftime()
    locale.setlocale(locale.LC_TIME, "de_CH.utf8")

    # create basic document
    geometry_options = {"left": "2cm", "right": "2cm", "top": "3cm", "bottom": "3cm"}
    document = Document(inputenc='utf8x', lmodern=True, geometry_options=geometry_options)
    document.documentclass = Command(
        'documentclass',
        options=['11pt', 'a4paper'],
        arguments=['article'],
    )

    document.packages.add(Package('floatpag'))
    document.packages.add(Package('hyperref', 'pdftex'))

    # globally packages
    document.packages.add(Package('babel', options='german'))

    # The clock of the server runs in UTC, the export date should be in Swiss local time. The date is
    # printed by \today, the time is set here, as \currenttime is fixed once the package datetime is loaded.
    now = datetime.datetime.now(ZoneInfo('Europe/Zurich'))
    document.preamble.append(NoEscape(r'\year={} \month={} \day={}'.format(now.year, now.month, now.day)))

    # page style, font, page numbers, etc.
    document.packages.add(Package('fancyhdr'))
    document.packages.add(Package('floatpag'))
    document.preamble.append(NoEscape(r'\fancypagestyle{plain}{ \lfoot{{\small ' +
                                      tex(camp.get_camp_name(), single_line=True) +
                                      r'}} \cfoot{\textbf{\thepage}} \rfoot{{\small Export vom {\today} ' +
                                      now.strftime('%H:%M') + '}}}'))

    document.preamble.append(Command('pagestyle', arguments='plain'))

    document.preamble.append(Command('renewcommand', arguments=Command('headrulewidth'), extra_arguments='0pt'))

    # TODO: Option for sans serif font
    # document.preamble.append(Command('renewcommand', arguments=Command('familydefault'), extra_arguments='sfdefault'))

    # babel uses the quotation mark for german shorthands, e.g. "a for ä. This also applies to the texts that
    # are escaped by pylatex, which does not know about it.
    document.append(NoEscape(r'\shorthandoff{"}'))

    document.append(NoEscape(r'\hypersetup{pdftitle = {' + tex(camp.get_camp_name(), single_line=True) +
                             '}, pdfauthor = {' + tex(camp.get_full_author_name(), single_line=True) + '}}'))

    # add sections according to export settings

    time_log = ["Time \tDocument part"]

    for part in parts:
        logging.log(logging.INFO, 'append ' + part.__name__)
        start_time = time.time()
        part(document, camp, args)
        document.append(NoEscape(r'\newpage'))
        time_log.append("{}s \t{}".format(round(time.time() - start_time, 2), part.__name__))

    for log in time_log:
        logging.log(logging.INFO, log)

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


def main(args: argparse.Namespace):
    set_up_logging()

    # TODO: check user quota

    # camp object that stores the exported date
    # '16fXu6siwVDX1OOb38P3', 'CKsbjuHkJQUstW1YULeAepDe9Wl1'
    camp = CampClass(args)

    create_pdf(camp, args)


def create_pdf(camp: CampClass, args: argparse.Namespace):
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
    file_name = '/export' + ('_' + args.camp_id + '_' + str(time.time()) if not args.dfn else '')
    file_path = dir_path + file_name
    document.generate_tex(file_path)
    try:
        run_pdflatex(dir_path, file_name.lstrip('/'))
    except CalledProcessError as err:
        # check if pdf in file_path exists
        if os.path.isfile(file_path + '.pdf'):
            print("PDF file created (but with some errors)")
        else:
            raise err

    # uncomment for uploading to bucket
    upload_blob(file_path, file_name, args.camp_id)


def parse_args():
    """
        Parses the command line arguments
    """

    # Read arguments from command line
    parser = setup_parser()
    args = parser.parse_args()

    return validate_args(args)


if __name__ == '__main__':
    args = parse_args()
    print(args)
    main(args)
