import copy

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


def combine_ingredients(ingredients):
    pass


def convert_to_base_unit(ingredients):
    pass


def categorize_ingredients(ingredients):
    return ingredients


class ShoppingList:
    """
    Helper class for creating a shopping list from a camp.
    """

    def __init__(self, camp: Camp):
        self.full_shopping_list = None
        self._camp = camp
        self._spellingCorrector = SpellingCorrector()

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
        self._spellingCorrector.fix_spelling_mistakes(ingredients)

        # (2) Combine ingredients and convert units
        convert_to_base_unit(ingredients)
        combine_ingredients(ingredients)

        # (3) Sort into categories
        self.full_shopping_list = categorize_ingredients(ingredients)

        return self
