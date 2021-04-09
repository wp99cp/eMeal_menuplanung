from pylatex import Section, Command, Package, Description, Subsubsection, Document
from pylatex.base_classes import Environment

from exportData.camp import Camp


class Multicols(Environment):
    escape = False
    content_separator = "\n"


class Spacing(Environment):
    escape = False
    content_separator = "\n"


def add_shopping_list(doc: Document, camp: Camp):
    # content for this page
    doc.append(Section('Einkaufsliste', numbering=False))

    # space between colums
    doc.append(Command('setlength'))
    doc.append(Command('columnsep', arguments='40pt'))

    doc.packages.add(Package('multicol'))
    doc.packages.add(Package('enumitem'))
    doc.packages.add(Package('setspace'))

    for _ in range(1):
        doc.append(Subsubsection('Gemüse und Früchte', numbering=False))

        with doc.create(Multicols(arguments='2')) as multicols:
            multicols.append(Command('small'))

            with multicols.create(Description(options='leftmargin=1.75cm, itemsep=4pt')) as itemize:
                # space between colums
                itemize.append(Command('setlength', arguments=Command('itemsep'), extra_arguments='0pt'))
                itemize.append(Command('setlength', arguments=Command('parskip'), extra_arguments='0pt'))

                itemize.add_item('100g', 'the first item')
                itemize.add_item('23 Stk.', 'Bananen')
                itemize.add_item('100g', 'the first item')
                itemize.add_item('10g', 'the item')
