from argparse import Namespace

from pylatex import Package, Command, NoEscape, SmallText, Subsubsection, Document

from exportData.camp import CampClass


def add_title_page(doc: Document, camp: CampClass, args: Namespace):
    # packages used for this page
    doc.packages.append(Package('datetime'))
    doc.packages.append(Package('graphicx'))
    doc.packages.append(Package('xcolor'))

    # create content
    doc.preamble.append(
        Command('title', NoEscape(r'\Huge \textbf{' +
                                  camp.get_camp_name() +
                                  r'} \\ \vspace{1.65cm} \Large \textbf{Handbuch Lagerküche}'
                                  r'\\ \vspace{11cm}')))

    doc.preamble.append(Command('author', NoEscape(r'\normalsize ' + camp.get_full_author_name())))
    doc.preamble.append(Command('date', NoEscape(r'\normalsize Version vom \today')))

    # no page numbers
    doc.append(Command('clearpage'))
    doc.append(Command('maketitle'))  # add title
    doc.append(Command('thispagestyle', arguments='empty'))

    doc.append(Command('vfill'))

    doc.append(Command('noindent'))
    doc.append(NoEscape('{'))
    doc.append(Command('color', arguments='gray'))
    doc.append(Subsubsection('Haftungsausschluss', numbering=False))
    doc.append(SmallText('Dieses Dokument wurde automatisch erstellt. Obwohl uns Qualität und Richtigkeit sehr am '
                         'Herzen liegt, können wir Fehler nie ganz ausschliessen. eMeal – Menüplanung haftet nicht '
                         'für Schäden, die im Zusammenhang mit diesem Export entstanden sind. Bitte kontrolliere '
                         'diesen Export vor dem Lager auf Vollständigkeit und Korrektheit. Das Team von eMeal - '
                         'Menüplanung wünscht ganz viel Spass im Lager.'))
    doc.append(NoEscape('}'))
