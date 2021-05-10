import copy
import datetime
import random
import unittest
from functools import reduce

from exportData.camp import Camp
from pdf_generator import create_pdf
from utils.commandline_args_parser import setup_parser


class TestSum(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Set commandline arguments
        parser = setup_parser()
        args = parser.parse_args(['None', 'None', '--mock_data'])

        cls.camp = Camp(args=args)

        cls.user_data = {'displayName': 'Maximilian Mastermind'}
        cls.camp_meta_info = {'camp_name': 'Sommerlager 2021 - Testlager',
                              'days': [
                                  {'day_description': 'Day 1', 'day_notes': '',
                                   'day_date': datetime.datetime(year=2021, day=21, month=5)},
                                  {'day_description': 'Day 2', 'day_notes': '',
                                   'day_date': datetime.datetime(year=2021, day=22, month=5)},
                                  {'day_description': 'Day 3', 'day_notes': '',
                                   'day_date': datetime.datetime(year=2021, day=23, month=5)},
                                  {'day_description': 'Day 4', 'day_notes': '',
                                   'day_date': datetime.datetime(year=2021, day=25, month=5)},
                                  {'day_description': 'Day 5', 'day_notes': '',
                                   'day_date': datetime.datetime(year=2021, day=26, month=5)}
                              ], 'camp_participants': 12}

        cls.specific_meals = [
            {'meal_id': '0PWg6RoMZDzkLz6TueD4', 'meal_weekview_name': 'Gefüllte Kartoffeln mit Salattt',
             'meal_description': '', 'meal_name': 'Gefüllte Kartoffeln mit Salat und einem Dessert',
             'meal_used_as': 'Znacht', 'meal_gets_prepared': False, 'meal_participants': 10,
             'meal_override_participants': False, 'doc_id': 'lcKt3mfiYl3X1OXhqaxu',
             'meal_date': datetime.datetime(year=2021, day=23, month=5),
             'recipe': [
                 {
                     'recipe_name': 'Taboulé (Couscous)',
                     'recipe_description': '',
                     'recipe_notes': 'Couscous, nach Anleitung zubereiten, in eine grosse Schüssel geben, '
                                     'restliche Zutaten zum Couscous in die Schüssel geben. ',
                     'recipe_used_for': 'all',
                     'recipe_override_participants': False,
                     'unique_id': 'J2cYCRBNbLP09uYbXXRs::LHcDCr4FlNhgxaPjEM9J',
                     'ingredients': [
                         {
                             'isAnOverwriting': False,
                             'food': 'Cousocus',
                             'unit': 'g',
                             'measure': 60.0,
                             'fresh': False,
                             'comment': 'Dies ist ein Kommentar'
                         }
                     ]}
             ]},
            {'meal_id': '0PWg6RoMZerzkLz6TueD4', 'meal_weekview_name': 'Gefüllte Tomaten',
             'meal_description': '', 'meal_name': 'Gefüllte Tomaten',
             'meal_used_as': 'Znacht', 'meal_gets_prepared': False, 'meal_participants': 15,
             'meal_override_participants': True, 'doc_id': 'lcKt3mfiYlerX1OXhqaxu',
             'meal_date': datetime.datetime(year=2021, day=25, month=5)}
        ]

        cls.camp.setMockData(cls.user_data, cls.camp_meta_info, cls.specific_meals)

    def test_camp_name(self):
        self.assertEqual('Sommerlager 2021 - Testlager', self.camp.get_camp_name())

    def test_author_name(self):
        self.assertEqual('Maximilian Mastermind', self.camp.get_full_author_name())

    def test_day_sort_order(self):
        # shuffle days
        camp_meta = copy.deepcopy(self.camp_meta_info)
        random.shuffle(camp_meta['days'])

        self.camp.setMockData(self.user_data, camp_meta, self.specific_meals)
        self.assertEqual(self.camp_meta_info['days'], self.camp.get_days())

    @classmethod
    def power_set(cls, lst):
        """
        power_set([1,2,3]) --> () (1,) (2,) (3,) (1,2) (1,3) (2,3) (1,2,3)"

        :param lst:
        :return: powerset
        """

        return reduce(lambda result, x: result + [subset + [x] for subset in result], lst, [[]])

    def test_pdf_creation(self):
        # Set commandline arguments
        parser = setup_parser()

        # TODO include all options
        optional_arguments = ['--wv', '--lscp', '--mp', '--fdb', '--spl', '--meals']

        for subset in self.power_set(optional_arguments):
            args = parser.parse_args(['None', 'None', '--mock_data', '--dfn'] + subset)
            create_pdf(self.camp, args)


if __name__ == '__main__':
    unittest.main()
