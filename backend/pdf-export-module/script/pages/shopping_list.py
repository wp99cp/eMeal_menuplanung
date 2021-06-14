from argparse import Namespace

from pylatex import Command, Package, Document, NoEscape, Section, MiniPage, Itemize
from pylatex.utils import bold

from exportData.camp import Camp
from pages.enviroments import Multicols
from shopping_list.shopping_list import ShoppingList


def add_shopping_list(doc: Document, camp: Camp, args: Namespace):
    doc.append(NoEscape(
        r' \fancyhf{ \lhead{Vollständige Einkaufsliste (Fortsetzung)} \cfoot{\thepage}}'))
    doc.append(NoEscape(r' \clearpage \pagestyle{fancy}'))

    doc.append(Section('Vollständige Einkaufsliste', numbering=False))
    doc.append('Vollständige Einkaufsliste für das gesamte Lager, d.h. inkl. allen Frisch-Produkten!')

    # content for this page
    doc.append(NoEscape(r' \vspace{0.75cm} \newline \vspace{0.75cm} \noindent '))

    # space between colums
    doc.append(Command('setlength'))
    doc.append(Command('columnsep', arguments='25pt'))

    doc.packages.add(Package('multicol'))
    doc.packages.add(Package('enumitem'))
    doc.packages.add(Package('setspace'))

    shoppingList = ShoppingList(camp)
    shoppingList.create_full_shopping_list()
    full_shopping_list = shoppingList.full_shopping_list

    for category_name in full_shopping_list.keys():
        append_category(category_name, doc, full_shopping_list)
        doc.append(NoEscape(r' \newline \vspace{0.75cm} \noindent'))

    doc.append(NoEscape(r' \clearpage \pagestyle{plain}'))


def append_category(category_name, doc, shopping_list):
    with doc.create(MiniPage()):
        doc.append(bold(category_name))
        with doc.create(Multicols(arguments='3')) as multicols:
            multicols.append(Command('small'))

            with multicols.create(Itemize(options='leftmargin=0.5cm, itemsep=4pt')) as itemize:
                # space between colums
                itemize.append(Command('setlength', arguments=Command('itemsep'), extra_arguments='0pt'))
                itemize.append(Command('setlength', arguments=Command('parskip'), extra_arguments='0pt'))

                append_ingredients(category_name, shopping_list, itemize)


def append_ingredients(category_name, shopping_list, itemize):
    for ing in shopping_list[category_name]:
        itemize.add_item(
            ing['food'] + ((', ' + str(ing['measure_calc']) + ' ' + ing['unit']) if ing['measure_calc'] > 0 else '')
        )
