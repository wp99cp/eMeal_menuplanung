import copy
import datetime
import json
import random
import unittest
from functools import reduce

from exportData.camp import Camp
from pdf_generator import create_pdf
from shopping_list.shopping_list import ShoppingList
from utils.commandline_args_parser import setup_parser


class TestSum(unittest.TestCase):

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

        cls.camp.setMockData(cls.user_data, cls.camp_meta_info, cls.specific_meals)

    @classmethod
    def load_mock_data(cls, path='tests/test_cases/16fXu6siwVDX1OOb38P3.json'):
        """
        Load mock data of a camp from a json file.

        :param path: path to a json file containing the mock data
        :return: mock data as json with date fields converted to data objects
        """

        # Opening JSON file
        f = open(path)
        mock_data = json.load(f)
        f.close()

        # Convert dates
        for meal in mock_data['meals']:
            meal['meal_date'] = datetime.datetime.strptime(meal['meal_date'], '%d.%m.%Y')
        for day in mock_data['camp_meta_info']['days']:
            day['day_date'] = datetime.datetime.strptime(day['day_date'], '%d.%m.%Y')

        return mock_data

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
        optional_arguments = []  # ['--wv', '--lscp', '--mp', '--fdb', '--spl', '--meals']

        for subset in self.power_set(optional_arguments):
            args = parser.parse_args(['None', 'None', '--mock_data', '--dfn'] + subset)
            create_pdf(self.camp, args)

    def test_shopping_list(self):
        shoppingList = ShoppingList(self.camp)
        shoppingList.create_full_shopping_list()

        print(shoppingList.full_shopping_list)


if __name__ == '__main__':
    unittest.main()
