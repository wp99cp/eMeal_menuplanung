from exportData.camp import Camp
from pylatex import NoEscape, Package, Tabularx, Command, Document
from pylatex.base_classes import Environment, Arguments


class Sidewaystable(Environment):
    packages = [Package('rotating')]
    escape = False
    content_separator = "\n"


class Makebox(Environment):
    escape = False
    content_separator = "\n"


def weekview_table(doc: Document, camp: Camp):
    # content for this page
    days = camp.get_days()

    # add packages
    doc.packages.add(Package('caption', options='tableposition=top'))
    doc.packages.add(Package('graphicx'))
    doc.packages.add(Package('float'))
    doc.packages.add(Package('floatpag'))

    with doc.create(Sidewaystable(options='p!')):

        doc.append(Command('small'))

        # define table look
        doc.append(Command('caption*', arguments=Arguments(NoEscape(r'\textbf{Wochenplan Sommerlager 2021}'))))
        doc.append(Command('centering'))
        doc.append(Command('newcolumntype', arguments='Y',
                           extra_arguments=Arguments(NoEscape(r'>{\arraybackslash}X'))))
        doc.append(Command('newcommand*'))
        doc.append(Command('rot', arguments=Command('rotatebox', options='origin=c', arguments='270')))
        doc.append(Command('renewcommand', arguments=Command('arraystretch'), extra_arguments='2.5'))

        column_template = r'| >{\bfseries}Y |'
        for _ in days:
            column_template += ' Y | '

        doc.append(NoEscape(r'\makebox[\textwidth]{'))  # open makebox

        with doc.create(Tabularx(NoEscape(column_template),
                                 width_argument=NoEscape(r'1.15\textwidth'))) as table_content:
            # reset width, since we use custom columntypes
            table_content.width = len(days) + 1

            # add header
            table_content.add_hline()
            table_content.add_row([''] + days)
            table_content.add_hline()
            table_content.add_hline()

            # get meal data
            meals = camp.get_meals_for_weekview()

            # add meals
            for meal_name in meals.keys():
                table_content.add_row([NoEscape(r'\centering ' + meal_name + r' \par ')] + meals[meal_name])
                table_content.add_hline()

        doc.append(Command('thisfloatpagestyle', arguments='empty'))
        doc.append(NoEscape(r'}%'))  # close makebox
