import os
import subprocess

from pylatex import NoEscape
from pylatex.utils import escape_latex

# Control characters are invalid in a LaTeX source, tabs and line breaks are handled separately
_CONTROL_CHARACTERS = {c: None for c in list(range(0x20)) + [0x7f] if chr(c) not in '\t\n'}

# The package babel (german) makes the quotation mark an active character, e.g. "a prints an umlaut
_ACTIVE_CHARACTERS = {'"': r'\dq{}'}


def tex(value, single_line=False) -> NoEscape:
    """

    Escapes a value such that LaTeX prints it as plain text. Every value that is not a constant of
    this module must pass through this function (or through the escaping of pylatex) before it is
    added to the document: names and descriptions from the database and the arguments of the request
    are written by the users, as LaTeX they could read any file the export module has access to.

    :param value: the text to print, None is printed as an empty string
    :param single_line: replaces line breaks with spaces, used where LaTeX allows no paragraph,
    e.g. in titles, headers and the cells of the weekview
    :return: the escaped text, marked as safe for pylatex

    """

    if value is None:
        return NoEscape('')

    text = str(value).replace('\r\n', '\n').replace('\r', '\n').translate(_CONTROL_CHARACTERS)
    if single_line:
        text = ' '.join(text.split())

    # escaped character by character, as pylatex would not touch a string that is already marked as safe
    return NoEscape(''.join(_ACTIVE_CHARACTERS.get(c) or escape_latex(c) for c in text))


def run_pdflatex(directory: str, file_name: str):
    """

    Compiles a LaTeX file to a PDF. As a second line of defence next to the escaping, pdflatex
    runs without shell escape and can only read and write files below the directory of the document
    (and the files of the TeX distribution): no absolute paths, no parent directories, no dotfiles.

    :param directory: directory of the LaTeX file, the PDF is written to it as well
    :param file_name: name of the LaTeX file without its extension
    :raises CalledProcessError: if pdflatex reports an error, the PDF may have been written nevertheless

    """

    env = dict(os.environ, openin_any='p', openout_any='p')
    command = ['pdflatex', '--interaction=nonstopmode', '--no-shell-escape', file_name + '.tex']

    try:
        subprocess.run(command, cwd=directory, env=env, check=True,
                       stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    except subprocess.CalledProcessError as err:
        print(err.output.decode(errors='replace'))
        raise
    finally:
        # remove the files that are only needed during the compilation
        for extension in ['aux', 'log', 'out']:
            try:
                os.remove(os.path.join(directory, file_name + '.' + extension))
            except FileNotFoundError:
                pass
