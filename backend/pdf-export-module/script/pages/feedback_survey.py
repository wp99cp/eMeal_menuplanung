from argparse import Namespace

from pylatex import Document, Section, Tabularx, NoEscape, Package

from exportData.camp import CampClass


def any_evaluable_meals_exist(camp: CampClass):

    for meal in camp.get_meal_names_for_feedback():
        if meal['meal_used_as'] in ['Zmittag', 'Znacht']:
            return True

    return False


def add_feedback_survey_page(doc: Document, camp: CampClass, args: Namespace):

    # check if any meal exist that should be evaluated (only 'Zmittag' and 'Znacht' will be listed)
    if not any_evaluable_meals_exist(camp):
        return

    doc.append(Section('Feedback der Teilnehmer zum Essen', numbering=False))

    doc.packages.add(Package('pifont'))

    doc.append(NoEscape(
        'Ich hoffe dir hat das Essen bei uns im Lager gefallen. '
        'Damit wir im nächsten Lager noch feiner kochen können, '
        'bitten wir dich die folgende Umfrage auszufüllen. '
        r'Bewerte die folgenden Mahlzeiten von \ding{172} bis \ding{176}'
        ' (schrecklich bis ausgezeichnet). ' if not args.fdbmsg else args.fdbmsg))

    doc.append(NoEscape(r'\vspace{2cm} \newline '))

    # Adds the Zmittags and Znachts as a Table to the page.
    # Each meal has five rating options (1) (2) (3) (4) (5).
    with doc.create(Tabularx('X c c c c c')) as table:
        for meal in camp.get_meal_names_for_feedback():
            if meal['meal_used_as'] in ['Zmittag', 'Znacht']:
                table.add_row([meal['meal_name'],
                               NoEscape(r'\ding{172}'),  # (1)
                               NoEscape(r'\ding{173}'),  # (2)
                               NoEscape(r'\ding{174}'),  # (3)
                               NoEscape(r'\ding{175}'),  # (4)
                               NoEscape(r'\ding{176}'),  # (5)
                               ])

    doc.append(NoEscape(r'\vspace{2cm} \newline '))

    # TODO: Automatically add main ingredients to list
    # doc.append('Welche Beilage oder welches Gemüse hättest du nicht gekocht? Bitte aus der Liste streichen.')
