import copy
import datetime
import json
import random
import unittest
from functools import reduce

import firebase_admin
from firebase_admin import credentials

from exportData.camp import CampClass
from exportData.utils import normalize_camp, normalize_recipe, normalize_specific_meal, overwrite_ingredients, \
    to_number, to_text
from pdf_generator import create_pdf
from shopping_list.shopping_list import ShoppingList
from utils.commandline_args_parser import setup_parser


class MockDataTester(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Set commandline arguments
        parser = setup_parser()
        args = parser.parse_args(['None', 'None', '--mock_data'])

        cls.camp = CampClass(args=args)

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

    def test_author_without_name(self):
        # accounts created with an email address and a password have no name, see #232
        for user_data in [{'displayName': None}, {}, None]:
            self.camp.setMockData(user_data, self.camp_meta_info, self.specific_meals)
            self.assertEqual('', self.camp.get_full_author_name())

        self.camp.setMockData(self.user_data, self.camp_meta_info, self.specific_meals)

    def test_day_sort_order(self):
        # shuffle days
        camp_meta = copy.deepcopy(self.camp_meta_info)
        random.shuffle(camp_meta['days'])

        self.camp.setMockData(self.user_data, camp_meta, self.specific_meals)
        self.assertEqual(self.camp_meta_info['days'], self.camp.get_days())


class TestCalculation(MockDataTester):

    @classmethod
    def recipe(cls, **data):
        return {'recipe_name': 'Bolognese', 'ingredients': [{'food': 'Hackfleisch', 'measure': 100, 'unit': 'g'}],
                **data}

    def load(self, recipes, camp=None, **meal_data):
        meal = {**copy.deepcopy(self.specific_meals[0]), 'recipe': recipes, **meal_data}
        camp_meta = {**copy.deepcopy(self.camp_meta_info), 'camp_participants': 20, 'camp_vegetarians': 5,
                     'camp_leaders': 3, **(camp or {})}

        self.camp.setMockData(self.user_data, camp_meta, [meal])

    def participants(self):
        return [recipe['recipe_participants'] for recipe in self.camp.get_specific_meals()[0]['recipe']]

    def test_user_groups(self):
        self.load([self.recipe(recipe_used_for=group) for group in ['all', 'non-vegetarians', 'vegetarians', 'leaders']])
        self.assertEqual([20, 15, 5, 3], self.participants())

    def test_calculation_runs_once(self):
        # the shopping list and the pages of the meals both request the measurements
        self.load([self.recipe(recipe_used_for='non-vegetarians', recipe_override_participants=True,
                               recipe_participants=12)])

        self.assertEqual([7], self.participants())
        self.assertEqual([7], self.participants())
        self.assertEqual(700, self.camp.get_specific_meals()[0]['recipe'][0]['ingredients'][0]['measure_calc'])

    def test_no_negative_participants(self):
        # a meal for fewer persons than the camp has vegetarians
        self.load([self.recipe(recipe_used_for='non-vegetarians')], meal_override_participants=True,
                  meal_participants=3)

        self.assertEqual([0], self.participants())

    def test_emptied_number_fields(self):
        # the frontend saves an emptied number field as null
        self.load([self.recipe(recipe_used_for='non-vegetarians', recipe_override_participants=True,
                               recipe_participants=None)],
                  camp={'camp_vegetarians': None, 'camp_leaders': None},
                  meal_override_participants=True, meal_participants=None)

        self.assertEqual([20], self.participants())


class TestNormalization(unittest.TestCase):

    def test_to_number(self):
        for value, number in [(1.5, 1.5), ('1,5', 1.5), (' 120 ', 120), (None, 0), (float('nan'), 0), ('1/2', 0),
                              ('', 0), (True, 0), ({}, 0)]:
            self.assertEqual(number, to_number(value), value)

    def test_unprintable_characters(self):
        # pdflatex can't print emojis
        self.assertEqual('Pasta  20°C ½ €', to_text('Pasta \U0001F35D\u2600\ufe0f 20°C ½ €'))
        self.assertEqual('', to_text(None))

    def test_incomplete_camp(self):
        camp = {'days': [{'day_date': datetime.datetime(2027, 7, 12)}, {'day_description': 'without date'}]}
        normalize_camp(camp)

        self.assertEqual('', camp['camp_name'])
        self.assertEqual([0, 0, 0], [camp['camp_participants'], camp['camp_vegetarians'], camp['camp_leaders']])
        self.assertEqual([{'day_date': datetime.datetime(2027, 7, 12), 'day_description': ''}], camp['days'])

    def test_incomplete_meal(self):
        meal = {'meal_gets_prepared': True}
        normalize_specific_meal(meal)

        self.assertEqual('', meal['meal_weekview_name'])
        self.assertEqual('', meal['meal_used_as'])
        self.assertFalse(meal['meal_gets_prepared'], 'a meal without a date can not be prepared')
        self.assertFalse(meal['meal_override_participants'])

    def test_incomplete_recipe(self):
        recipe = {'recipe_used_for': 'kids', 'ingredients': [
            {'food': 'Salz'},
            {'food': None, 'measure': 5},
            {'food': ' Rahm 35% ', 'measure': float('nan'), 'unit': None, 'comment': None, 'fresh': None},
            'no ingredient']}
        normalize_recipe(recipe)

        self.assertEqual('all', recipe['recipe_used_for'])
        self.assertEqual(['', '', ''], [recipe['recipe_name'], recipe['recipe_description'], recipe['recipe_notes']])
        self.assertEqual([
            {'food': 'Salz', 'measure': 0, 'unit': '', 'comment': '', 'fresh': False},
            {'food': 'Rahm 35%', 'measure': 0, 'unit': '', 'comment': '', 'fresh': False}], recipe['ingredients'])

        recipe = {'ingredients': None}
        normalize_recipe(recipe)
        self.assertEqual([], recipe['ingredients'])

    def test_overwrite_ingredients(self):
        ingredients = [{'unique_id': 'a', 'food': 'Spaghetti', 'measure': 120}, {'unique_id': 'b', 'food': 'Salz'}]
        overwrites = [{'unique_id': 'a', 'food': 'Spaghetti', 'measure': 150}, {'unique_id': 'c', 'food': 'Butter'}]

        self.assertEqual(
            [overwrites[0], ingredients[1], overwrites[1]], overwrite_ingredients(ingredients, overwrites))
        self.assertEqual(ingredients, overwrite_ingredients(ingredients, None))
        self.assertEqual(overwrites, overwrite_ingredients(None, overwrites))


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
