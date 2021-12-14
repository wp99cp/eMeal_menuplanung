from argparse import Namespace
from datetime import timedelta

from pylatex import NoEscape, Package, Tabularx, Command, Document, Figure
from pylatex.base_classes import Arguments

from exportData.camp import Camp
from pages.enviroments import Sidewaystable, Landscape


def weekview_table(doc: Document, camp: Camp, args: Namespace):
    # content for this page
    days = camp.get_days()
    days = list(map(lambda d: NoEscape((d['day_date'] + timedelta(hours=2)).strftime("%A, \\par %d. %b %Y")), days))

    # add packages
    doc.packages.add(Package('caption', options='tableposition=top'))
    doc.packages.add(Package('graphicx'))
    doc.packages.add(Package('float'))
    doc.packages.add(Package('floatpag'))

    if args.lscp:
        doc.packages.add(Package('pdflscape'))
        with doc.create(Landscape()):
            with doc.create(Figure()):
                add_table(camp, days, doc, args)
    else:
        with doc.create(Sidewaystable(options='pH!')):
            add_table(camp, days, doc, args)


def prepareMealsForWeekview(camp: Camp, args: Namespace):
    day_as_dates = camp.get_days_as_dates()
    meal_weekview = {}

    for meal_type in camp.get_meal_type_names():
        meal_weekview[meal_type] = [NoEscape('')] * len(day_as_dates)

    for meal in camp.get_meals_for_weekview():
        meal_weekview.get(meal.get('meal_used_as'))[day_as_dates.index(meal.get('meal_date'))] += NoEscape(
            meal.get('meal_weekview_name'))

        if meal.get('meal_gets_prepared') and args.mp:

            prepare_date = meal.get('meal_prepare_date')

            if prepare_date in day_as_dates:
                day_index = day_as_dates.index(prepare_date)
                meal_weekview.get('Vorbereiten')[day_index] += \
                             (meal.get('meal_date') + timedelta(hours=2)).strftime("%A") +
                             r'}} \vspace{0.20cm}  \par ')

    return meal_weekview


def add_table(camp, days, doc, args: Namespace):
    doc.append(Command('small'))

    # define table look
    doc.append(Command('caption*', arguments=Arguments(
        NoEscape(r'\centering \textbf{Wochenplan ' + camp.get_camp_name() + r' }'))))
    doc.append(Command('centering'))
    doc.append(Command('newcolumntype', arguments='Y',
                       extra_arguments=Arguments(NoEscape(r'>{\centering\arraybackslash}X'))))
    doc.append(Command('newcommand*'))
    doc.append(Command('rot', arguments=Command('rotatebox', options='origin=c', arguments='270')))
    doc.append(Command('renewcommand', arguments=Command('arraystretch'), extra_arguments='2.5'))

    column_template = r'| >{\bfseries}Y |'
    for _ in days:
        column_template += ' Y | '

    doc.append(NoEscape(r'\makebox[\textwidth]{'))  # open makebox

    with doc.create(Tabularx(NoEscape(column_template), width_argument=NoEscape(
            ('1.75' if args.lscp else '1.15') + r'\textwidth'))) as table_content:
        # reset width, since we use custom columntypes
        table_content.width = len(days) + 1

        # add header
        table_content.add_hline()
        table_content.add_row([''] + days)
        table_content.add_hline()
        table_content.add_hline()

        # get meal data
        meals = prepareMealsForWeekview(camp, args=args)

        # add meals
        for meal_name in meals.keys():
            table_content.add_row([NoEscape(meal_name)] + meals[meal_name])
            table_content.add_hline()

    doc.append(Command('thisfloatpagestyle', arguments='empty'))
    doc.append(NoEscape(r'}%'))  # close makebox

    doc.append(Command('small'))
    doc.append(Command('par'))
    doc.append(NoEscape(r'\vspace * {.35cm}'))

    doc.append(NoEscape(camp.get_TN_description()))
