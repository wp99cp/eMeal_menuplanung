import datetime
from argparse import Namespace

from pylatex import NoEscape, Command, Document, Package, Tabularx, Table, Description, Center

import exportData.camp
from pages.global_constants import FRESH_PRODUCT_SYMBOL


def add_meals(doc: Document, camp: exportData.camp.CampClass, args: Namespace):
    doc.packages.append(Package('xcolor'))
    doc.packages.append(Package('tabularx'))
    doc.packages.append(Package('colortbl'))
    doc.packages.append(Package('enumitem'))
    doc.packages.append(Package('float'))
    doc.packages.append(Package('subcaption'))
    doc.packages.append(Package('multirow'))

    doc.packages.append(Package('caption', options=[NoEscape(r'textfont={large, bf}'), 'labelformat=empty',
                                                    'justification=raggedright']))

    # for each meal
    for meal in camp.get_specific_meals():

        add_header(doc, meal)

        doc.append(NoEscape(
            r'\fancypagestyle{recipestyle}{ \lhead{' + meal['meal_name'] + ' als ' + meal[
                'meal_used_as'] + r' (Fortsetzung)} \cfoot{\thepage}}'))

        # general Infos
        with doc.create(Description()) as enum:
            if meal['meal_gets_prepared']:
                enum.add_item('Vorbereiten:',
                              'am ' + (meal['meal_prepare_date'] + datetime.timedelta(hours=2)).strftime(
                                  "%A %d. %b %Y"))

            if meal['meal_description'] != '':
                enum.add_item('Notizen:', meal['meal_description'].strip('\n'))

        # add recipes
        if 'recipe' in meal:
            for recipe in meal['recipe']:
                add_recipe(doc, recipe)

        else:
            doc.append('Diese Mahlzeit enthält keine Rezepte.')

        doc.append(NoEscape(r' \clearpage \pagebreak'))


def add_header(doc, meal):
    doc.append(Command('renewcommand', arguments=Command('arraystretch'), extra_arguments='1.75'))
    doc.append(NoEscape(r'\definecolor{light-gray}{gray}{0.85}'))
    doc.append(Command('arrayrulecolor', arguments=NoEscape(r'light-gray')))
    with doc.create(Center()) as centered_section:

        if 'meal_name' not in meal:
            meal['meal_name'] = ''
            meal['meal_description'] = ''
            print('Warning: meal_name not found in meal: ' + str(meal['meal_id']))

        centered_section.append(NoEscape(r' \center \LARGE \textbf{' + meal['meal_name'] + r'} \par %'))
        centered_section.append(NoEscape(r'\color{gray} \large \textbf{' +
                                         (meal['meal_date'] + datetime.timedelta(hours=2)).strftime(
                                             "%A, %d. %b") + r'} / '))
        centered_section.append(NoEscape(r'\color{gray} \large \textbf{' + meal['meal_used_as'] + r'} \par'))


def add_ingredient(table_content, ingredient):
    table_content.add_row([
        round(ingredient['measure'], 2) if ingredient['measure'] != 0 else '',
        round(ingredient['measure_calc'], 2) if ingredient['measure'] != 0 else '',
        ingredient['unit'],
        NoEscape(ingredient['food'] + ((r' (%s)' % FRESH_PRODUCT_SYMBOL) if ingredient['fresh'] else '')),
        ingredient['comment']
    ])


def get_participants_description(recipe):
    """
    Describes the participants. I.g., is this recipe for vegetarians only, or only for leaders?

    :param recipe: a recipe for which the participants description should be created
    :return: string with a short description of the participants
    """
    if 'recipe_used_for' in recipe:
        if recipe['recipe_used_for'] == 'non-vegetarians':
            return 'nur für Nicht-Vegis'
        elif recipe['recipe_used_for'] == 'vegetarians':
            return 'nur für Vegis'
        elif recipe['recipe_used_for'] == 'leaders':
            return 'nur für Leiter*innen'

    return 'für alle'


def add_recipe(doc, recipe):
    doc.append(Command('vspace', arguments='0.75cm'))

    doc.append(Command('renewcommand', arguments=Command('arraystretch'), extra_arguments='1.25'))

    if 'ingredients' in recipe and len(recipe['ingredients']) > 0:
        with doc.create(Table(position='h')) as table:

            doc.packages.append(Package('floatpag'))
            doc.append(NoEscape(r' \floatpagestyle{recipestyle}'))

            table.add_caption(recipe['recipe_name'] + ' (' + get_participants_description(recipe) + ', ' + str(
                recipe['recipe_participants']) + ' Per.)')

            with table.create(Tabularx('| r | r | l | l | X |', width_argument=NoEscape(r'\textwidth'))) \
                    as table_content:
                table_content.add_hline()
                table_content.add_row(
                    [NoEscape(r'\tiny{1 Per.}'),
                     NoEscape(r'\tiny{' + str(recipe['recipe_participants']) + ' Per.}'),
                     NoEscape(r'\tiny{Einheit}'), NoEscape(r'\tiny{Lebensmittel}'), NoEscape(r'\tiny{Kommentar}')])
                table_content.add_hline()
                for ingredient in recipe['ingredients']:
                    add_ingredient(table_content, ingredient)
                    table_content.add_hline()

            table.append(NoEscape(r'\par \vspace{0.6cm}'))

            # add section for 'recipe_description' or 'recipe_notes' if one is none-empty
            if recipe['recipe_description'] + recipe['recipe_notes'] != '':
                with table.create(Tabularx('l X', width_argument=NoEscape(r'\textwidth'))) as table_content:
                    if recipe['recipe_description'] != '':
                        table_content.add_row(['Beschreibung: ', recipe['recipe_description'].strip('\n')])
                    if recipe['recipe_notes'] != '':
                        table_content.add_row(['Notizen:', recipe['recipe_notes'].strip('\n')])
