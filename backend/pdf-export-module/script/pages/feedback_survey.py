from argparse import Namespace

from exportData.camp import Camp
from pylatex import Document, Section, Tabularx, NoEscape, Package


def add_feedback_survey_page(doc: Document, camp: Camp, args: Namespace):
    doc.append(Section('Feedback der Teilnehmer zum Essen', numbering=False))

    doc.packages.add(Package('pifont'))

    doc.append(NoEscape(
        'Ich hoffe dir hat das Essen bei uns im Lager gefallen. '
        'Damit wir im nächsten Lager noch feiner kochen können, '
        'bitten wir dich die folgende Umfrage auszufüllen. '
        r'Bewerte die folgenden Mahlzeiten von \ding{172} bis \ding{176}'
        ' (schrecklich bis ausgezeichnet). '))

    doc.append(NoEscape(r'\vspace{2cm} \newline '))

    with doc.create(Tabularx('X c c c c c')) as table:

        for meal in camp.get_meal_names_for_feedback():

            if meal['meal_used_as'] in ['Zmittag', 'Znacht']:
                table.add_row([meal['meal_name'],
                               NoEscape(r'\ding{172}'),
                               NoEscape(r'\ding{173}'),
                               NoEscape(r'\ding{174}'),
                               NoEscape(r'\ding{175}'),
                               NoEscape(r'\ding{176}')])

    doc.append(NoEscape(r'\vspace{2cm} \newline '))

    # TODO: Automatically add main ingredients to list
    # doc.append('Welche Beilage oder welches Gemüse hättest du nicht gekocht? Bitte aus der Liste streichen.')

    pass
