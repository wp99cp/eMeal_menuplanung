import copy
import random
import string
import time

import firebase_admin
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


    Basic idea: Creating the shopping lists is a multi stage process. For each type of shopping
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

        # Use the application default credentials
        cred = credentials.Certificate('keys/cevizh11-firebase-adminsdk.json')
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
        ingredients.sort(key=lambda ing: ing['food'] + ing['unit'])

        ingredients_uncategorized = copy.deepcopy(ingredients)
        ingredients.clear()

        current_sum = None
        for i, ing in enumerate(ingredients_uncategorized):

            ing = {
                'food': ing['food'],
                'unit': ing['unit'],
                'measure_calc': ing['measure_calc']
            }

            if current_sum is not None and ing['food'] == current_sum['food'] and ing['unit'] == current_sum['unit']:
                current_sum['measure_calc'] += ing['measure_calc']
            else:
                current_sum = ing
                ingredients.append(ing)

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
    def categorize_ingredients(cls, ingredients):
        """

        This function converts a list of ingredients to a categorised list of ingredients.

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

        return ingredients_categorized

    def create_full_shopping_list(self):
        """

        Includes all meals to create a full shopping list for the complete camp.
        This function ignores fresh products and merges all recipes of all meals into a single shopping list.

        :return: shopping list object
        """

        # Load meals for that shopping list
        meals = self._camp.get_specific_meals()

        # create an array with all ingredients of the camp
        ingredients = []
        for meal in meals:
            if 'recipe' in meal:
                for recipe in meal['recipe']:
                    if 'ingredients' in recipe:
                        ingredients += copy.deepcopy(recipe['ingredients'])

        # (1) fix spelling mistakes
        start_time = time.time()
        self._spellingCorrector.fix_spelling_mistakes(ingredients)
        print("--- %s seconds ---" % (time.time() - start_time))

        # (2) Combine ingredients and convert units
        start_time = time.time()
        self.convert_to_base_unit(ingredients)
        print("--- %s seconds ---" % (time.time() - start_time))

        start_time = time.time()
        self.combine_ingredients(ingredients)
        print("--- %s seconds ---" % (time.time() - start_time))

        # (3) Sort into categories
        start_time = time.time()
        self.full_shopping_list = self.categorize_ingredients(ingredients)
        print("--- %s seconds ---" % (time.time() - start_time))

        return self
