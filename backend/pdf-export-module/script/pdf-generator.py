import locale
import logging
import os

from exportData.camp import Camp
from google.cloud import storage
from google.oauth2 import service_account
from pages.meals import add_meals
from pages.shopping_list import add_shopping_list
from pages.title_page import add_title_page
from pages.weekview_table import weekview_table
from pylatex import Command, NoEscape, Package
from pylatex import Document
from telegraf_logger import TelegrafLogger


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


def generate_document(parts):
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

    # camp object that stores the exported date
    camp = Camp('WRhzcGYImUWC1DV3MPaf', 'CKsbjuHkJQUstW1YULeAepDe9Wl1')

    # add sections according to export settings
    for part in parts:
        logging.log(logging.INFO, 'append ' + part.__name__)
        part(document, camp)
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
    # global settings
    parts = [add_title_page, weekview_table, add_shopping_list, add_meals]  # [add_meals]

    set_up_logging()

    # generate document form parts
    document = generate_document(parts)

    # page style, page numbers, etc.
    document.packages.add(Package('fancyhdr'))
    document.append(Command('pagestyle', arguments='plain'))
    document.append(Command('renewcommand', arguments=Command('headrulewidth'), extra_arguments='0pt'))

    # create PDF file
    dir_path = os.path.dirname(os.path.realpath(__file__))
    file_name = dir_path + '/fullPDF'
    document.generate_pdf(clean_tex=False, filepath=file_name, compiler='pdflatex')

    # uncomment for uploading to bucket
    # upload_blob(file_name + '.pdf')


if __name__ == '__main__':
    main()
