import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'script'))

from pydantic import ValidationError
from pylatex import NoEscape

from utils.export_args import parse_request_args
from utils.latex import tex


class TestLatexEscaping(unittest.TestCase):
    """
    Text written by the users must never be interpreted as LaTeX, see utils/latex.py.
    Run it with `python tests/test_input_sanitising.py`, it needs no database.
    """

    def test_commands_are_printed_as_text(self):
        escaped = tex(r'\input{../keys/firebase/key.json}')

        self.assertEqual(r'\textbackslash{}input\{../keys/firebase/key.json\}', escaped)
        self.assertIsInstance(escaped, NoEscape)

    def test_no_active_character_is_left(self):
        escaped = tex('\\ { } $ & # ^ _ ~ % "')

        for command in [r'\textbackslash{}', r'\{', r'\}', r'\$', r'\&', r'\#', r'\^{}', r'\_',
                        r'\textasciitilde{}', r'\%', r'\dq{}']:
            self.assertIn(command, escaped)
            escaped = escaped.replace(command, '', 1)

        self.assertEqual('', escaped.strip())

    def test_character_codes_can_not_build_a_backslash(self):
        self.assertEqual(r'\^{}\^{}5cinput', tex('^^5cinput'))

    def test_text_marked_as_safe_is_escaped_as_well(self):
        self.assertEqual(r'\textbackslash{}today', tex(NoEscape(r'\today')))

    def test_control_characters_are_removed(self):
        self.assertEqual('ab', tex('a\x00\x07\x1b\x7fb'))

    def test_line_breaks(self):
        self.assertEqual('a\\newline%\nb', tex('a\r\nb'))
        self.assertEqual('a b c', tex('a\n\n b\tc ', single_line=True))

    def test_plain_text_is_unchanged(self):
        self.assertEqual('Älplermagronen mit Öpfelmues, 2.5 kg', tex('Älplermagronen mit Öpfelmues, 2.5 kg'))
        self.assertEqual('', tex(None))


class TestRequestArguments(unittest.TestCase):

    def test_settings_of_the_frontend(self):
        args = parse_request_args('CeviDB-0123456789abcdef01-42', '16fXu6siwVDX1OOb38P3', {
            '--spl': '', '--ncols': '3', '--invm': '', '--fdb': '', '--fdbmsg': 'Wie war das Essen?'})

        self.assertEqual('16fXu6siwVDX1OOb38P3', args.camp_id)
        self.assertEqual('CeviDB-0123456789abcdef01-42', args.user_id)
        self.assertTrue(args.spl and args.invm and args.fdb)
        self.assertFalse(args.wv or args.meals or args.lscp or args.mp)
        self.assertEqual(3, args.ncols)
        self.assertEqual(2, args.minNIng)
        self.assertEqual('Wie war das Essen?', args.fdbmsg)

    def test_invalid_settings_are_rejected(self):
        for query in [{'--ncols': '5'}, {'--ncols': 'two'}, {'--minNIng': '-1'}, {'--wv': 'maybe'},
                      {'--unknown': ''}, {'--fdbmsg': 'x' * 1001}]:
            with self.assertRaises(ValidationError, msg=query):
                parse_request_args('user', 'camp', query)

    def test_invalid_ids_are_rejected(self):
        for doc_id in ['', '../keys', 'a/b', 'a b', 'a.tex', 'x' * 129]:
            with self.assertRaises(ValidationError, msg=doc_id):
                parse_request_args('user', doc_id, {})
            with self.assertRaises(ValidationError, msg=doc_id):
                parse_request_args(doc_id, 'camp', {})

    def test_debug_settings_are_not_available(self):
        for query in [{'--dfn': ''}, {'--mock_data': ''}]:
            with self.assertRaises(ValidationError, msg=query):
                parse_request_args('user', 'camp', query)

        args = parse_request_args('user', 'camp', {})
        self.assertFalse(args.dfn or args.mock_data)

    def test_ids_can_not_be_overwritten(self):
        args = parse_request_args('user', 'camp', {'--camp_id': 'other', '--user_id': 'other'})

        self.assertEqual('camp', args.camp_id)
        self.assertEqual('user', args.user_id)


if __name__ == '__main__':
    unittest.main()
