from argparse import Namespace
from datetime import timedelta

from pylatex import Command, Package, Document, NoEscape, Section, MiniPage, Itemize
from pylatex.utils import bold

from exportData.camp import CampClass
from pages.enviroments import Multicols
from pages.global_constants import FRESH_PRODUCT_SYMBOL
from shopping_list.shopping_list import ShoppingList


def add_shopping_lists(doc: Document, camp: CampClass, args: Namespace):
    shoppingList = ShoppingList(camp)

    add_full_shopping_list(args, doc, shoppingList)

    for day in camp.get_days_as_dates():
        add_day_shopping_list(args, doc, shoppingList, day)


def add_day_shopping_list(args: Namespace, doc: Document, shoppingList: ShoppingList, day):
    shoppingList.create_day_shopping_list(day, args)

    date = (day + timedelta(hours=2)).strftime("%A, %d. %b")

    shopping_list_name = 'Tageseinkaufsliste ' + date
    shopping_list_description = 'Diese Einkaufsliste enthält alle Zutaten für den {}, ' \
                                'insbesondere also auch die Frischprodukte. ' \
                                'Diese werden dabei mit Symbol {} gekennzeichnet.'.format(date, FRESH_PRODUCT_SYMBOL)
    add_shopping_list(args, doc, shoppingList.full_shopping_list, shopping_list_description, shopping_list_name,
                      include_fresh=True)


def add_full_shopping_list(args: Namespace, doc: Document, shoppingList: ShoppingList):
    # create and add full shopping list
    shoppingList.create_full_shopping_list(args)
    shopping_list_name = 'Vollständige Lagereinkaufsliste'
    shopping_list_description = 'Dies ist die vollständige Einkaufsliste für das gesamte Lager, d.h., ' \
                                'in dieser Liste sind alle Zutaten aufgelistet, insbesondere also auch ' \
                                'die Frischprodukte. Diese werden dabei mit Symbol %s gekennzeichnet.' \
                                % FRESH_PRODUCT_SYMBOL
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
    doc.append(NoEscape(r' \fancypagestyle{specialstyle}{ \lhead{' + shopping_list_name + r' (Fortsetzung)} \cfoot{\thepage}}'))
    doc.append(NoEscape(r' \fancypagestyle{noheader}{ \lhead{}}'))
    doc.append(NoEscape(r' \clearpage \pagestyle{specialstyle} \thispagestyle{noheader} '))

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
    for i, category_name in enumerate(shopping_list.keys()):
        if i > 0:
            doc.append(NoEscape(r' \newline \vspace{0.75cm} \noindent'))
        append_category_columns(category_name, doc, shopping_list, args, include_fresh)

    doc.append(NoEscape(r' \clearpage \pagestyle{noheader}'))


def append_category_columns(category_name, doc, shopping_list, args, include_fresh):
    with doc.create(MiniPage()):
        doc.append(bold(category_name))

        if int(args.ncols) == 1:
            append_category(args, category_name, doc, include_fresh, shopping_list)
            return

        n_cols = int(args.ncols) if int(args.ncols) in [1, 2, 3, 4] else 2
        with doc.create(Multicols(arguments=str(n_cols))):
            append_category(args, category_name, doc, include_fresh, shopping_list)


def append_category(args, category_name, doc, include_fresh, shopping_list):
    doc.append(Command('small'))

    # check if the shopping_list has at least one non-fresh ingredient if include_fresh is False
    # we can safely skip such a category
    if not include_fresh and sum(1 for ing in shopping_list[category_name] if not ing['fresh']) == 0:
        return

    with doc.create(Itemize(options='leftmargin=0.5cm, itemsep=4pt')) as itemize:
        itemize.append(Command('setlength', arguments=Command('itemsep'), extra_arguments='0pt'))
        itemize.append(Command('setlength', arguments=Command('parskip'), extra_arguments='0pt'))

        append_ingredients(category_name, shopping_list, itemize, args, include_fresh)


def append_ingredients(category_name, shopping_list, itemize, args, include_fresh):
    for ing in shopping_list[category_name]:

        if not include_fresh and ing['fresh']:
            continue

        food_name = ing['food'] + (r' (%s)' % FRESH_PRODUCT_SYMBOL if ing['fresh'] else '')
        measure_as_str = str(round(ing['measure_calc'], 2))

        if args.invm:
            itemize.add_item(NoEscape(
                food_name + ((', ' + measure_as_str + ' ' + ing['unit']) if ing['measure_calc'] > 0 else '')))
        else:
            itemize.add_item(NoEscape(
                ((measure_as_str + ' ' + ing['unit'] + ' ') if ing['measure_calc'] > 0 else '') + food_name))
