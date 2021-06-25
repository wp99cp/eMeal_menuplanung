import copy
import datetime
import json
import random
import unittest
from functools import reduce

import firebase_admin
from firebase_admin import credentials

from exportData.camp import Camp
from pdf_generator import create_pdf
from shopping_list.shopping_list import ShoppingList
from utils.commandline_args_parser import setup_parser


class MockDataTester(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Set commandline arguments
        parser = setup_parser()
        args = parser.parse_args(['None', 'None', '--mock_data'])

        cls.camp = Camp(args=args)

        mock_data = cls.load_mock_data()

        cls.user_data = {'displayName': 'Maximilian Mastermind'}
        cls.camp_meta_info = mock_data['camp_meta_info']
        cls.specific_meals = mock_data['meals']

        cls.shopping_list = mock_data['shopping_list']

        cls.camp.setMockData(cls.user_data, cls.camp_meta_info, cls.specific_meals)

    @classmethod
    def load_mock_data(cls, path='tests/test_cases/simple_camp_test.json'):
        """
        Load mock data of a camp from a json file.

        :param path: path to a json file containing the mock data
        :return: mock data as json with date fields converted to data objects
        """
        # Opening JSON file
        with open(path, encoding='utf-8') as f:
            mock_data = json.load(f)

        # Convert dates
        for meal in mock_data['meals']:
            meal['meal_date'] = datetime.datetime.strptime(meal['meal_date'], '%d.%m.%Y')
        for day in mock_data['camp_meta_info']['days']:
            day['day_date'] = datetime.datetime.strptime(day['day_date'], '%d.%m.%Y')

        return mock_data


class TestShoppingList(MockDataTester):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        # Use the application default credentials
        cred = credentials.Certificate('keys/cevizh11-firebase-adminsdk.json')
        firebase_admin.initialize_app(cred)

    def test_shopping_list__combine_ingredients(self):
        shoppingList = ShoppingList(None)

        ingredients = [
            {'food': 'Peperoni', 'measure_calc': 100.0, 'unit': 'g'},
            {'food': 'Peperoni', 'measure_calc': 100.0, 'unit': 'g'},
            {'food': 'Peperoni', 'measure_calc': 1.0, 'unit': 'kg'},
            {'food': 'Peperoni', 'measure_calc': 120.0, 'unit': 'g'},
            {'food': 'Milch', 'measure_calc': 2.0, 'unit': 'l'},
            {'food': 'Peperoni', 'measure_calc': 5.0, 'unit': 'kg'},
        ]

        ingredients_correct_sum = [
            {'food': 'Milch', 'measure_calc': 2.0, 'unit': 'l'},
            {'food': 'Peperoni', 'measure_calc': 320.0, 'unit': 'g'},
            {'food': 'Peperoni', 'measure_calc': 6.0, 'unit': 'kg'}
        ]

        ingredients_correct_sum.sort(key=lambda i: i['food'] + i['unit'])
        shoppingList.combine_ingredients(ingredients)
        self.assertEqual(ingredients_correct_sum, ingredients)

    def test_shopping_list__convert_units(self):
        shoppingList = ShoppingList(None)

        ingredients = [
            {'food': 'Zughetti', 'measure_calc': 100.0, 'unit': 'g'},
            {'food': 'Zughetti', 'measure_calc': 120.0, 'unit': 'g'},
            {'food': 'Wasser', 'measure_calc': 2.0, 'unit': 'dl'},
            {'food': 'Wasser', 'measure_calc': 5.0, 'unit': 'ml'},
        ]

        ingredients_correct_unit = [
            {'food': 'Zughetti', 'measure_calc': 0.1, 'unit': 'kg'},
            {'food': 'Zughetti', 'measure_calc': 0.120, 'unit': 'kg'},
            {'food': 'Wasser', 'measure_calc': 0.2, 'unit': 'l'},
            {'food': 'Wasser', 'measure_calc': 0.005, 'unit': 'l'},
        ]

        shoppingList.convert_to_base_unit(ingredients)
        self.assertEqual(ingredients_correct_unit, ingredients)

    def test_shopping_list(self):
        shoppingList = ShoppingList(self.camp)
        shoppingList.create_full_shopping_list()

        self.assertEqual(self.shopping_list, shoppingList.full_shopping_list)


class TestDataFetcher(MockDataTester):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()

    def test_camp_name(self):
        self.assertEqual(self.camp_meta_info['camp_name'], self.camp.get_camp_name())

    def test_author_name(self):
        self.assertEqual('Maximilian Mastermind', self.camp.get_full_author_name())

    def test_day_sort_order(self):
        # shuffle days
        camp_meta = copy.deepcopy(self.camp_meta_info)
        random.shuffle(camp_meta['days'])

        self.camp.setMockData(self.user_data, camp_meta, self.specific_meals)
        self.assertEqual(self.camp_meta_info['days'], self.camp.get_days())


class TestPDFCreation(MockDataTester):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()

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
        optional_arguments = []

        for subset in self.power_set(optional_arguments):
            args = parser.parse_args(
                ['None', 'None', '--mock_data', '--dfn', '--wv', '--lscp', '--mp', '--fdb', '--spl',
                 '--meals'] + subset)
            create_pdf(self.camp, args)


if __name__ == '__main__':
    unittest.main()
