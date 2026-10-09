import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'script'))

from shopping_list.admin_decisions import AdminDecisions
from shopping_list.spelling_corrector import SpellingCorrector


class FakeDocument:

    def __init__(self):
        self.writes = []

    def set(self, data, merge=False):
        self.writes.append(data)


class FakeDatabase:

    def __init__(self):
        self.doc = FakeDocument()

    def document(self, path):
        return self.doc


class TestAdminDecisions(unittest.TestCase):
    """
    The decisions of the admins on the shopping list, see shopping_list/admin_decisions.py.
    Run it with `python tests/test_admin_decisions.py`, it needs no database.
    """

    def test_missing_document(self):
        decisions = AdminDecisions(None)

        self.assertEqual({}, decisions.categories)
        self.assertEqual(set(), decisions.ignored)

    def test_fields_are_read(self):
        decisions = AdminDecisions({
            'categories': [{'food_item': 'Tofu', 'category_name': 'Milchprodukte und Eier'}],
            'ignored': ['asdf'],
            'acceptedCorrections': [{'from': 'Spagetti', 'to': 'Spaghetti'}],
            'rejectedCorrections': ['Reiss']
        })

        self.assertEqual({'Tofu': 'Milchprodukte und Eier'}, decisions.categories)
        self.assertEqual({'asdf'}, decisions.ignored)
        self.assertEqual({('Spagetti', 'Spaghetti')}, decisions.accepted_corrections)
        self.assertEqual({'Reiss'}, decisions.rejected_corrections)

    def test_malformed_entries_are_skipped(self):
        decisions = AdminDecisions({
            'categories': ['Tofu', {'food_item': 'Tofu'}, {'food_item': 1, 'category_name': 'Saucen'}],
            'ignored': 'asdf',
            'rejectedCorrections': [None, 'Reiss']
        })

        self.assertEqual({}, decisions.categories)
        self.assertEqual(set(), decisions.ignored)
        self.assertEqual({'Reiss'}, decisions.rejected_corrections)


class TestSpellingCorrector(unittest.TestCase):

    def correct(self, food, **decisions):
        db = FakeDatabase()
        ingredients = [{'food': food}]
        SpellingCorrector(db, ['Spaghetti', 'Reis'], **decisions).fix_spelling_mistakes(ingredients)
        return ingredients[0]['food'], db.doc.writes

    def test_correction_is_logged(self):
        food, writes = self.correct('Spagetti')

        self.assertEqual('Spaghetti', food)
        self.assertEqual(1, len(writes))

    def test_reviewed_correction_is_applied_but_not_logged(self):
        food, writes = self.correct('Spagetti', reviewed={('Spagetti', 'Spaghetti')})

        self.assertEqual('Spaghetti', food)
        self.assertEqual([], writes)

    def test_kept_name_is_not_corrected(self):
        food, writes = self.correct('Reiss', keep={'Reiss'})

        self.assertEqual('Reiss', food)
        self.assertEqual([], writes)


if __name__ == '__main__':
    unittest.main()
