from argparse import Namespace

from pylatex import Command, Package, Document, NoEscape, Section, MiniPage, Itemize
from pylatex.utils import bold

from exportData.camp import Camp
from pages.enviroments import Multicols
from shopping_list.shopping_list import ShoppingList


def add_shopping_lists(doc: Document, camp: Camp, args: Namespace):
    shoppingList = ShoppingList(camp)

    add_full_shopping_list(args, doc, shoppingList)


def add_full_shopping_list(args: Namespace, doc: Document, shoppingList: ShoppingList):
    # create and add full shopping list
    shoppingList.create_full_shopping_list()
    shopping_list_name = 'Vollständige Lagereinkaufsliste'
    shopping_list_description = 'Dies ist die vollständige Einkaufsliste für das gesamte Lager, d.h., in dieser Liste ' \
                                'sind alle Zutaten aufgelistet, insbesondere also auch die Frischprodukte. ' \
                                r'Diese werden dabei mit Symbol \includegraphics[height=1.25 ' \
                                r'\fontcharht\font`\B]{./assets/icons/outline_water_drop_48dp} gekennzeichnet.'
    add_shopping_list(args, doc, shoppingList.full_shopping_list, shopping_list_description, shopping_list_name,
                      include_fresh=True)

    # create and add full shopping list
    shopping_list_name = 'Lagereinkaufsliste der haltbaren Produkte'
    shopping_list_description = 'Dies ist die Einkaufsliste aller haltbaren Lebensmittel für das gesamte Lager. ' \
                                'Achtung, d.h., auf dieser Liste Fehlen alle Frisch-Produkte.'
    add_shopping_list(args, doc, shoppingList.full_shopping_list, shopping_list_description, shopping_list_name,
                      include_fresh=False)


def add_shopping_list(args: Namespace,
                      doc: Document,
                      shopping_list: ShoppingList,
                      shopping_list_description: str,
                      shopping_list_name: str,
                      include_fresh=True):
    """
    Adds a shopping_list to the document.
    """

    # set page header for next page
    doc.append(NoEscape(r' \fancyhf{ \lhead{' + shopping_list_name + r' (Fortsetzung)} \cfoot{\thepage}}'))
    doc.append(NoEscape(r' \clearpage \pagestyle{fancy}'))

    # add shopping list title
    doc.append(Section(shopping_list_name, numbering=False))
    doc.append(NoEscape(shopping_list_description))

    # content for this page
    doc.append(NoEscape(r' \vspace{0.75cm} \newline \vspace{0.75cm} \noindent '))

    # space between colums
    doc.append(Command('setlength'))
    doc.append(Command('columnsep', arguments='25pt'))
    doc.packages.add(Package('multicol'))
    doc.packages.add(Package('enumitem'))
    doc.packages.add(Package('setspace'))

    # add ingredients in categories
    for category_name in shopping_list.keys():
        append_category(category_name, doc, shopping_list, args, include_fresh)
        doc.append(NoEscape(r' \newline \vspace{0.75cm} \noindent'))

    doc.append(NoEscape(r' \clearpage \pagestyle{plain}'))


def append_category(category_name, doc, shopping_list, args, include_fresh):
    with doc.create(MiniPage()):
        doc.append(bold(category_name))
        with doc.create(Multicols(arguments='3')) as multicols:
            multicols.append(Command('small'))

            with multicols.create(Itemize(options='leftmargin=0.5cm, itemsep=4pt')) as itemize:
                # space between colums
                itemize.append(Command('setlength', arguments=Command('itemsep'), extra_arguments='0pt'))
                itemize.append(Command('setlength', arguments=Command('parskip'), extra_arguments='0pt'))

                append_ingredients(category_name, shopping_list, itemize, args, include_fresh)


def append_ingredients(category_name, shopping_list, itemize, args, include_fresh):
    for ing in shopping_list[category_name]:

        if not include_fresh and ing['fresh']:
            continue

        food_name = ing['food'] + (
            r' (\includegraphics[height=1.25 \fontcharht\font`\B]{./assets/icons/outline_water_drop_48dp})' if
            ing['fresh'] else '')

        if args.invm:
            itemize.add_item(NoEscape(
                food_name + ((', ' + str(ing['measure_calc']) + ' ' + ing['unit']) if ing['measure_calc'] > 0 else '')))
        else:
            itemize.add_item(NoEscape(
                ((str(ing['measure_calc']) + ' ' + ing['unit'] + ' ') if ing['measure_calc'] > 0 else '') + food_name))
