import copy
import random
import string
import time

import firebase_admin
from argparse import Namespace
from firebase_admin import firestore, credentials

from exportData.camp import Camp
from shopping_list.spelling_corrector import SpellingCorrector

"""

     Shopping List

     * -------- *
     |          | - *
     |  meals   |   |    ==>   fixing spelling mistakes       <--     Load list of ingredients form DB
     |          |   |          (using editing distance)
     * -------- *   |
        * --------- *                   ||
                                        VV

                                combining ingredients and    ==>    * -------- *
                                   transforming units               |          | - *    A) Complete shopping list
                                                                    | shopping |   |       -> containing all ingredients
                                                                    |  lists   |   |
                                                                    |          |   |    B) Basic List (first day)
                                                                    |          |   |       and daily lists with fresh
                                                                    * -------- *   |       products
                                                                       * --------- *


    Basic idea: Creating the shopping lists is a multi-tage process. For each type of shopping
    list we walk through the following steps.

    (1) We fix spelling mistakes in the ingredients of each meal. Using minimal editing distance.

    (2) We now can combine the ingredients. Note: We only combine ingredients spelled exactly the same
        but including the fixes from step (1). For calculating the sums accordingly, we convert all
        units to ISO-base units (e.g. milliliters to liters). For some ingredients, e.g. for water,
        we also can convert between units.

    (3) Next, we check if the word is in the list of known ingredients. For that we convert the name of the
        ingredient to lower case. If so, we can return the corresponding category. If no category found, we
        check for related ingredients in our database and check if a sub-word is in known category.
        Unknown ingredients get logged for manual categorising. In the shopping list the get shown under
        the "uncategorized" category.

"""


class ShoppingList:
    """
    Helper class for creating a shopping list from a camp.
    """

    def __init__(self, camp: Camp):
        self.full_shopping_list = None
        self._camp = camp
        self.checked_spelling = False
        self.meals = None

        # Use the application default credentials
        cred = credentials.Certificate('../keys/firebase/cevizh11-firebase-adminsdk.json')
        app = firebase_admin.initialize_app(
            cred,
            name=''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(8)))
        ShoppingList.__db = firestore.client(app)

        # load data for unit conversion
        unit_conversions = ShoppingList.__db.document('sharedData/units').get().to_dict()
        ShoppingList._base_units = {k: v for (k, v) in unit_conversions.items() if v['only_for_food_item'] == ''}
        ShoppingList._special_conversions = {k: v for (k, v) in unit_conversions.items() if
                                             v['only_for_food_item'] != ''}

        ShoppingList.categories = ShoppingList.__db.document('sharedData/categories').get().to_dict()

        self._spellingCorrector = SpellingCorrector(ShoppingList.__db)

    @classmethod
    def combine_ingredients(cls, ingredients):
        """

        Combine ingredients with the same food name. This method modifies the passed ingredients
        object and therefore does not return anything.

        The ingredients get sorted by food name, then a linear scan combine ingredients with the same food name.

        :param ingredients: list of the ingredients
        """

        # Sort by food name and measure name
        ingredients.sort(key=lambda _ing: _ing['food'] + _ing['unit'] + str(_ing['fresh']))

        ingredients_uncategorized = copy.deepcopy(ingredients)
        ingredients.clear()

        # The idea behind the merging algorithm is to sum up the measurements as long as the name, the unit and
        # fresh/none-fresh-value of consecutive ingredients are identical. If one of it changes, we flush the buffer
        # into the ingredients object.
        ing_buf = None

        for ing in ingredients_uncategorized:

            # drop unnecessary ingredient fields
            ing = {
                'food': ing['food'],
                'unit': ing['unit'],
                'measure_calc': ing['measure_calc'],
                'fresh': ing['fresh']
            }

            if ing_buf is not None and \
                    ing['food'] == ing_buf['food'] and \
                    ing['unit'] == ing_buf['unit'] and \
                    ing['fresh'] == ing_buf['fresh']:
                ing_buf['measure_calc'] += ing['measure_calc']

            else:
                # flush buffer and replace content with new ingredient
                if ing_buf is not None:
                    ingredients.append(ing_buf)
                ing_buf = ing

        # final flush of buffer
        if ing_buf is not None:
            ingredients.append(ing_buf)

    @classmethod
    def convert_to_base_unit(cls, ingredients):
        """
        Will convert all ingredients to its base unit. E.g. "100 g Äpfel" -> "0.1 kg Äpfel"

        :param ingredients: list of ingredients
        """

        for ing in ingredients:

            if ing['unit'] + ':' + ing['food'] in cls._special_conversions.keys():
                conversion = cls._special_conversions[ing['unit'] + ':' + ing['food']]
                ing['unit'] = conversion['base_unit']
                ing['measure_calc'] *= conversion['factor']

            if ing['unit'] + ':' in cls._base_units.keys():
                conversion = cls._base_units[ing['unit'] + ':']
                ing['unit'] = conversion['base_unit']
                ing['measure_calc'] *= conversion['factor']

            ing['measure_calc'] = round(ing['measure_calc'], 3)

    @classmethod
    def categorize_ingredients(cls, ingredients, args: Namespace):
        """

        This function converts a list of ingredients to a categorised list of ingredients.

        :param args:
        :param ingredients: as a list of dicts
        :return: ingredients categorised as a dict
        """

        ingredients_categorized = {}

        # ingredients with unknown categories will be logged
        # to the database to categorise it manually.
        category_unknown = []

        for ing in ingredients:
            # Add ingredients to the corresponding category
            if ing['food'] in cls.categories.keys():
                ing_category = cls.categories[ing['food']]
                if ing_category['category_name'] in ingredients_categorized.keys():
                    ingredients_categorized[ing_category['category_name']].append(ing)
                else:
                    ingredients_categorized[ing_category['category_name']] = [ing]

            # Unknown ingredients will be added to the 'Diverses' category
            else:
                category_unknown.append(ing['food'])
                if 'Diverses' in ingredients_categorized.keys():
                    ingredients_categorized['Diverses'].append(ing)
                else:
                    ingredients_categorized['Diverses'] = [ing]

        # write unknown ingredients to the database
        if len(category_unknown) > 0:
            cls.__db.document('sharedData/foodCategories') \
                .update({'uncategorised': firestore.ArrayUnion(category_unknown)})


        # Merge categories with less than args.minNIng elements
        min_number_of_ings = int(args.minNIng) if int(args.minNIng) else 1
        final_categories = {}
        for cat_names in ingredients_categorized.keys():
            if cat_names == 'Diverses' or len(ingredients_categorized[cat_names]) <= min_number_of_ings:
                if 'Diverses' in final_categories:
                    final_categories['Diverses'].extend(ingredients_categorized[cat_names])
                else:
                    final_categories['Diverses'] = ingredients_categorized[cat_names]
                continue
            final_categories[cat_names] = ingredients_categorized[cat_names]

        return final_categories

    def create_full_shopping_list(self, args: Namespace):
        """

        Includes all meals to create a full shopping list for the complete camp.
        This function ignores fresh products and merges all recipes of all meals into a single shopping list.

        :return: shopping list object
        """

        # Load meals for that shopping list
        meals = self.get_meals()

        # create an array with all ingredients of the camp
        ingredients = []
        for meal in meals:
            if 'recipe' in meal:
                for recipe in meal['recipe']:
                    if 'ingredients' in recipe:
                        ingredients += recipe['ingredients']

        self.full_shopping_list = self.finish_shopping_list(ingredients, args)
        return self

    def finish_shopping_list(self, ingredients, args: Namespace):

        # (1) fix spelling mistakes
        if not self.checked_spelling:
            self.checked_spelling = True
            start_time = time.time()
            self._spellingCorrector.fix_spelling_mistakes(ingredients)
            print("--- %s seconds for fix_spelling_mistakes---" % (time.time() - start_time))

        # create a copy of the ingredients
        ingredients = copy.deepcopy(ingredients)

        # (2) Combine ingredients and convert units
        start_time = time.time()
        self.convert_to_base_unit(ingredients)
        print("--- %s seconds for convert_to_base_unit---" % (time.time() - start_time))

        start_time = time.time()
        self.combine_ingredients(ingredients)
        print("--- %s seconds for combine_ingredients---" % (time.time() - start_time))

        # (3) Sort into categories
        start_time = time.time()
        full_shopping_list = self.categorize_ingredients(ingredients, args)
        print("--- %s seconds for categorize_ingredients---" % (time.time() - start_time))

        return full_shopping_list

    def create_day_shopping_list(self, day, args: Namespace):

        # Load meals for that shopping list
        meals = self.get_meals()

        # create an array with all ingredients of the camp
        ingredients = []
        for meal in meals:

            if meal['meal_date'] != day:
                continue

            if 'recipe' in meal:
                for recipe in meal['recipe']:
                    if 'ingredients' in recipe:
                        ingredients += recipe['ingredients']

        self.full_shopping_list = self.finish_shopping_list(ingredients, args)
        return self

    def get_meals(self):

        if not self.meals:
            # Load meals for that shopping list
            self.meals = self._camp.get_specific_meals()

        return self.meals
