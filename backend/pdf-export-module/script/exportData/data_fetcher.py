import copy
from argparse import Namespace

import firebase_admin
from firebase_admin import credentials, firestore

from script.exportData.utils import convert_document

# defines order of meal types
meal_types = ['Zmorgen', 'Znüni', 'Zmittag', 'Zvieri', 'Znacht', 'Leitersnack', 'Vorbereiten']


class DataFetcher(object):

    def __init__(self, args: Namespace):

        self.camp_id = args.camp_id
        self.user_id = args.user_id

        self.args = args

        self._user_data = None
        self._user_data_fetched = False

        self._camp_meta_info = None
        self._camp_meta_info_fetched = False

        self._specific_meals = None
        self._specific_meals_loaded = False

        self._meals_loaded = False

        self._used_meal_types = None

        self._recipes_loaded = False

        # Use the application default credentials
        cred = credentials.Certificate('keys/cevizh11-firebase-adminsdk.json')
        firebase_admin.initialize_app(cred)
        self.__db = firestore.client()

    def _fetch_user_data(self):
        user_ref = self.__db.document(u'users/' + self.user_id)
        self._user_data = user_ref.get().to_dict()
        self._user_data_fetched = True

    def _fetch_camp_meta_data(self):
        camp_ref = self.__db.document(u'camps/' + self.camp_id)
        self._camp_meta_info = camp_ref.get().to_dict()
        self._camp_meta_info_fetched = True

        # sort days according to its dates
        self._camp_meta_info.get('days').sort(key=lambda d: d.get('day_date'))

    def _fetch_specific_meals(self):
        meal_refs = self.__db.collection_group(u'specificMeals')
        query_ref = meal_refs.where(u'used_in_camp', u'==', self.camp_id)
        self._specific_meals = list(map(lambda doc: convert_document(doc), query_ref.stream()))

    def _fetch_meals(self):
        """
          Load the data form the meal object and add it to the specific meal data.
          The following fields gets added: 'meal_name'

        """

        if not self._specific_meals_loaded:
            self._fetch_specific_meals()

        meal_refs = self.__db.collection(u'meals')
        query_ref = meal_refs.where(u'used_in_camps', u'array_contains', self.camp_id)

        meals = list(map(lambda doc: convert_document(doc), query_ref.stream()))

        for meal in meals:
            for specMeal in self._specific_meals:
                if specMeal['meal_id'] == meal['doc_id']:
                    specMeal['meal_name'] = meal['meal_name']
                    specMeal['meal_description'] = meal['meal_description']

    def _fetch_recipes(self):

        if not self._specific_meals_loaded:
            self._fetch_specific_meals()

        if not self._meals_loaded:
            self._fetch_meals()

        meal_ids = list(map(lambda m: m['meal_id'], self._specific_meals))

        recipes = []

        # 'array_contains_any' supports max 10 values
        for meal_ids_max_10 in [meal_ids[x:x + 10] for x in range(0, len(meal_ids), 10)]:
            recipe_refs = self.__db.collection(u'recipes')
            recipe_query_ref = recipe_refs.where(u'used_in_meals', u'array_contains_any', meal_ids_max_10)
            recipes = recipes + list(map(lambda doc: convert_document(doc), recipe_query_ref.stream()))

        for recipe in recipes:
            for meal in self._specific_meals:
                if meal['meal_id'] in recipe['used_in_meals']:

                    recipe = copy.deepcopy(recipe)

                    if 'recipe' in meal:
                        meal['recipe'].append(recipe)
                    else:
                        meal['recipe'] = [recipe]

        for meal in self._specific_meals:
            if 'recipe' in meal:

                for recipe in meal['recipe']:
                    spec_recipe_refs = self.__db.document(
                        u'recipes/' + recipe['doc_id'] + '/specificRecipes/' + meal['doc_id'])

                    spec_recipe_doc = spec_recipe_refs.get()

                    if spec_recipe_doc.to_dict() is not None:
                        spec_recipe = convert_document(spec_recipe_doc)
                    else:
                        # If you create a new recipe for a meal that is already used in another camp
                        # and you did not open the recipe in the other camp, the the specific recipe
                        # does not exist in the database. We insert the default data.
                        spec_recipe = {
                            'recipe_used_for': 'all',
                            'recipe_participants': 0,  # this value is ignored if override_participants is false
                            'recipe_override_participants': False
                        }

                    recipe['unique_id'] = meal['doc_id'] + '::' + recipe['doc_id']
                    recipe['recipe_used_for'] = spec_recipe['recipe_used_for']
                    recipe['recipe_participants'] = spec_recipe['recipe_participants']
                    recipe['recipe_override_participants'] = spec_recipe['recipe_override_participants']

        # sort meals
        self._specific_meals = sorted(self._specific_meals, key=lambda x: meal_types.index(x['meal_used_as']))
        self._specific_meals = sorted(self._specific_meals, key=lambda x: x['meal_date'])
