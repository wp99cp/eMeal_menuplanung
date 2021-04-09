from datetime import timezone, timedelta

import firebase_admin
from firebase_admin import firestore, credentials
from pylatex import NoEscape


def convert_document(doc):
    document = doc.to_dict()
    document['doc_id'] = doc.id

    return document


# defines order of meal types
meal_types = ['Zmorgen', 'Znüni', 'Zmittag', 'Zvieri', 'Znacht', 'Leitersnack', 'Vorbereiten']


class Camp(object):
    """ Represents a camp in the database.

    This class should be used as an abstract interface for accessing camp data during exporting a camp. Fetching data is
    performed in a lazy mode, i.g., data gets only fetched if requested.

    """

    def __init__(self, camp_id, user_id):
        self.camp_id = camp_id
        self.user_id = user_id

        self.__user_data = None
        self.__user_data_fetched = False

        self.__camp_meta_info = None
        self.__camp_meta_info_fetched = False

        self.__specific_meals = None
        self.__specific_meals_loaded = False

        self.__meals_loaded = False

        self.__used_meal_types = None

        self.__recipes_loaded = False

        # Use the application default credentials
        cred = credentials.Certificate('keys/cevizh11-firebase-adminsdk.json')
        firebase_admin.initialize_app(cred)
        self.__db = firestore.client()

    def __fetch_user_data(self):
        user_ref = self.__db.document(u'users/' + self.user_id)
        self.__user_data = user_ref.get().to_dict()
        self.__user_data_fetched = True

    def __fetch_camp_meta_data(self):
        camp_ref = self.__db.document(u'camps/' + self.camp_id)
        self.__camp_meta_info = camp_ref.get().to_dict()
        self.__camp_meta_info_fetched = True

        # sort days according to its dates
        self.__camp_meta_info.get('days').sort(key=lambda d: d.get('day_date'))

    def __fetch_specific_meals(self):
        meal_refs = self.__db.collection_group(u'specificMeals')
        query_ref = meal_refs.where(u'used_in_camp', u'==', self.camp_id)
        self.__specific_meals = list(map(lambda doc: convert_document(doc), query_ref.stream()))

    def __fetch_meals(self):
        """
          Load the data form the meal object and add it to the specific meal data.
          The following fields gets added: 'meal_name'

        """

        if not self.__specific_meals_loaded:
            self.__fetch_specific_meals()

        meal_refs = self.__db.collection(u'meals')
        query_ref = meal_refs.where(u'used_in_camps', u'array_contains', self.camp_id)

        meals = list(map(lambda doc: convert_document(doc), query_ref.stream()))

        for meal in meals:
            for specMeal in self.__specific_meals:
                if specMeal['meal_id'] == meal['doc_id']:
                    specMeal['meal_name'] = meal['meal_name']
                    specMeal['meal_description'] = meal['meal_description']

    def get_full_author_name(self):
        """
        :return: name of the current user, the author of the export
        """

        if not self.__user_data_fetched:
            self.__fetch_user_data()

        return self.__user_data.get('displayName')

    def __fetch_recipes(self):

        if not self.__specific_meals_loaded:
            self.__fetch_specific_meals()

        if not self.__meals_loaded:
            self.__fetch_meals()

        meal_ids = list(map(lambda m: m['meal_id'], self.__specific_meals))

        recipes = []

        # 'array_contains_any' supports max 10 values
        for meal_ids_max_10 in [meal_ids[x:x + 10] for x in range(0, len(meal_ids), 10)]:
            recipe_refs = self.__db.collection(u'recipes')
            recipe_query_ref = recipe_refs.where(u'used_in_meals', u'array_contains_any', meal_ids_max_10)
            recipes = recipes + list(map(lambda doc: convert_document(doc), recipe_query_ref.stream()))

        for recipe in recipes:
            for meal in self.__specific_meals:
                if meal['meal_id'] in recipe['used_in_meals']:

                    recipe = recipe.copy()

                    if 'recipe' in meal:
                        meal['recipe'].append(recipe)
                    else:
                        meal['recipe'] = [recipe]

        for meal in self.__specific_meals:
            if 'recipe' in meal:

                for recipe in meal['recipe']:
                    spec_recipe_refs = self.__db.document(
                        u'recipes/' + recipe['doc_id'] + '/specificRecipes/' + meal['doc_id'])

                    spec_recipe = convert_document(spec_recipe_refs.get())

                    recipe['unique_id'] = meal['doc_id'] + ':::' + recipe['doc_id']
                    recipe['recipe_used_for'] = spec_recipe['recipe_used_for']
                    recipe['recipe_participants'] = spec_recipe['recipe_participants']
                    recipe['recipe_override_participants'] = spec_recipe['recipe_override_participants']

        self.__calc_measurements()

        # sort meals
        self.__specific_meals = sorted(self.__specific_meals, key=lambda x: meal_types.index(x['meal_used_as']))
        self.__specific_meals = sorted(self.__specific_meals, key=lambda x: x['meal_date'])

    def __calc_measurements(self):
        """

            camp
              - camp_participants                                   e.g.    20
              - camp_leaders (fixed)                                e.g.    7
              - camp_vegetarians (fixed)                            e.g.    5

            --> meals
              - meal_participants (if meal_override_participants)   e.g.    18

            ----> recipes
                - recipe_participants (if recipe_override_participants)                                                 12      12          12      12
                - recipe_used_for (all, vegi, non-vegi, leader)             all     non-vegi    vegi    leader          all     non-vegi    vegi    leader
                                                                            18      13          5       0 (not woring)  12      7           5       0 (not woring)
        """

        if not self.__camp_meta_info_fetched:
            self.__fetch_camp_meta_data()

        for meal in self.__specific_meals:

            if not meal['meal_override_participants']:
                meal['meal_participants'] = self.__camp_meta_info['camp_participants']

            if 'recipe' in meal:
                for recipe in meal['recipe']:

                    if not recipe['recipe_override_participants']:
                        recipe['recipe_participants'] = meal['meal_participants']

                    if recipe['recipe_used_for'] == 'all':
                        pass
                    elif recipe['recipe_used_for'] == 'non-vegetarians':
                        recipe['recipe_participants'] -= self.__camp_meta_info['camp_vegetarians']

                    # 'vegetarians' and 'leaders' will never been overwritten
                    elif recipe['recipe_used_for'] == 'vegetarians':
                        recipe['recipe_participants'] = self.__camp_meta_info['camp_vegetarians']
                    elif recipe['recipe_used_for'] == 'leaders':
                        recipe['recipe_participants'] = self.__camp_meta_info['camp_leaders']

                    else:
                        raise Exception(
                            "Unknown used_for value! The used_for value must be in ['all', 'non-vegetarians',"
                            "'vegetarians', 'leaders']. But used_for was " + recipe['recipe_used_for'])

                    for ing in recipe['ingredients']:

                        if ing['measure']:
                            ing['measure'] = float(ing['measure'])
                            ing['measure_calc'] = float(ing['measure']) * recipe['recipe_participants']
                        else:
                            ing['measure'] = 0
                            ing['measure_calc'] = 0

    def get_camp_name(self):
        """
        :return: The full name of the camp
        """

        if not self.__camp_meta_info_fetched:
            self.__fetch_camp_meta_data()

        return self.__camp_meta_info.get('camp_name')

    def get_meal_type_names(self):
        """

        Creates a list of all used meal type names. The resulting list is ordered
        according as follows: Zmorgen, Znüni, Zmittag, Zvieri, Znacht, Leitersnack,
        Vorbereiten. The three main meals, i.g., Zmorgen, Zmittag, Znacht, are always included.

        :return: an array of meal type names.
        """

        if self.__used_meal_types:
            return self.__used_meal_types

        if not self.__specific_meals_loaded:
            self.__fetch_specific_meals()

        # includes only meals types actually used; Zmorgen, Zmittag, and Znacht are always included
        self.__used_meal_types = ['Zmorgen', 'Zmittag', 'Znacht'] + list(
            map(lambda m: m.get('meal_used_as'), self.__specific_meals))

        # add Vorbereiten if used
        for meal in self.__specific_meals:
            if meal.get('meal_gets_prepared'):
                self.__used_meal_types += ['Vorbereiten']
                break

        self.__used_meal_types = sorted(self.__used_meal_types, key=lambda x: meal_types.index(x))

        return self.__used_meal_types

    def get_meals_for_weekview(self):
        if not self.__specific_meals_loaded:
            self.__fetch_specific_meals()

        day_as_dates = list(map(lambda d: d['day_date'], self.__camp_meta_info.get('days')))

        meal_weekview = {}
        for meal_type in self.get_meal_type_names():
            meal_weekview[meal_type] = [NoEscape('')] * len(day_as_dates)

        for meal in self.__specific_meals:
            meal_weekview.get(meal.get('meal_used_as'))[day_as_dates.index(meal.get('meal_date'))] += NoEscape(meal.get(
                'meal_weekview_name') + r' \newline ')
            if meal.get('meal_gets_prepared'):
                meal_weekview.get('Vorbereiten')[
                    day_as_dates.index(meal.get('meal_prepare_date'))] += \
                    NoEscape(meal.get('meal_weekview_name') + r"  \newline \tiny \textit{für " +
                             meal.get('meal_prepare_date').strftime("%A %d. %b %Y") + r'}')

        return meal_weekview

    def get_meals_for_meal_page(self):
        if not self.__specific_meals_loaded:
            self.__fetch_specific_meals()

        if not self.__meals_loaded:
            self.__fetch_meals()

        if not self.__recipes_loaded:
            self.__fetch_recipes()

        return self.__specific_meals

    def get_days(self):
        if not self.__camp_meta_info_fetched:
            self.__fetch_camp_meta_data()

        def date_to_str(day):
            return day['day_date'].strftime("%A %d. %b %Y")

        days = list(map(date_to_str, self.__camp_meta_info.get('days')))

        return days
