import unicodedata

from pylatex import NoEscape
from pylatex.utils import escape_latex


def _is_printable(char: str) -> bool:
    """
    :return: False for characters pdflatex can't print, i.g. control characters and emojis. They would cause
    a LaTeX error.
    """

    if char in '\n\t':
        return True

    code = ord(char)

    return not (code > 0xFFFF  # emojis and other characters outside the basic multilingual plane
                or 0x2600 <= code <= 0x27BF  # miscellaneous symbols and dingbats
                or 0xFE00 <= code <= 0xFE0F  # variation selectors
                or unicodedata.category(char).startswith('C'))


def printable(text: str) -> str:
    """
    :return: the text without the characters pdflatex can't print
    """

    return ''.join(filter(_is_printable, text))


def tex(text, multiline=False) -> NoEscape:
    """
    Escapes a text entered by a user, such that it can be written into the LaTeX source. Every text of a user
    that is concatenated into a NoEscape string must go through this function, otherwise characters like % or _
    break the document and LaTeX commands inside the text get executed.

    :param text: text entered by a user, None is treated as an empty text
    :param multiline: keeps line breaks, by default they are replaced by a space
    :return: the escaped text
    """

    if text is None:
        return NoEscape('')

    text = printable(str(text))

    if multiline:
        text = text.strip()
    else:
        text = ' '.join(text.split())

    return escape_latex(text)
