from argparse import Namespace

from pylatex import Section, Command, Package, Description, Document, NoEscape
from pylatex.utils import bold

from exportData.camp import Camp
from pages.enviroments import Multicols
from shopping_list.shopping_list import ShoppingList


def add_shopping_list(doc: Document, camp: Camp, args: Namespace):
    # content for this page
    doc.append(Section('Einkaufsliste', numbering=False))

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
        doc.append(bold(category_name))

        with doc.create(Multicols(arguments='3')) as multicols:
            multicols.append(Command('small'))

            with multicols.create(Description(options='leftmargin=0.5cm, itemsep=4pt')) as itemize:
                # space between colums
                itemize.append(Command('setlength', arguments=Command('itemsep'), extra_arguments='0pt'))
                itemize.append(Command('setlength', arguments=Command('parskip'), extra_arguments='0pt'))

                for ing in full_shopping_list[category_name]:
                    itemize.add_item('[ ]', ing['food'] + ', ' +
                                     (str(ing['measure_calc']) if ing['measure_calc'] > 0 else ' ') + ' ' + ing['unit'])

        doc.append(NoEscape(r'\vspace{0.5cm} \noindent'))
