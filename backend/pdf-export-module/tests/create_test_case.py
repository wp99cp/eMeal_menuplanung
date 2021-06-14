import argparse
import copy
import json

import firebase_admin
from firebase_admin import credentials, firestore


def convert_date(obj_ref, field_name):
    obj_ref[field_name] = obj_ref[field_name].strftime('%d.%m.%Y')


def convert_document(doc):
    """

    Helper function to convert a firebase document to a python dictionary. Adds an extra field
    containing the firebase document id called `doc_id`.

    :param doc: A firebase document
    :return: content of the document with an extra field containing the document id

    """
    document = doc.to_dict()
    document['doc_id'] = doc.id

    return document


def load_recipe_data(db, specific_meals, test_case_data):
    meal_ids = list(map(lambda m: m['meal_id'], specific_meals))
    recipes = []

    # Load recipes for DB
    # 'array_contains_any' supports max 10 values
    for meal_ids_max_10 in [meal_ids[x:x + 10] for x in range(0, len(meal_ids), 10)]:
        recipe_refs = db.collection(u'recipes')
        recipe_query_ref = recipe_refs.where(u'used_in_meals', u'array_contains_any', meal_ids_max_10)
        recipes = recipes + list(map(lambda doc: convert_document(doc), recipe_query_ref.stream()))

    for recipe in recipes:
        for meal in specific_meals:
            if meal['meal_id'] in recipe['used_in_meals']:
                recipe = copy.deepcopy(recipe)
                if 'recipe' in meal:
                    meal['recipe'].append(recipe)
                else:
                    meal['recipe'] = [recipe]

    for meal in specific_meals:
        if 'recipe' in meal:
            for recipe in meal['recipe']:
                spec_recipe_refs = db.document(
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

    # defines order of meal types
    meal_types = ['Zmorgen', 'Znüni', 'Zmittag', 'Zvieri', 'Znacht', 'Leitersnack', 'Vorbereiten']

    # sort meals
    specific_meals = sorted(specific_meals, key=lambda x: meal_types.index(x['meal_used_as']))
    specific_meals = sorted(specific_meals, key=lambda x: x['meal_date'])

    test_case_data['meals'] = specific_meals
    for meal in test_case_data['meals']:
        convert_date(meal, 'date_added')
        convert_date(meal, 'date_modified')
        convert_date(meal, 'meal_date')
        convert_date(meal, 'meal_prepare_date')

        for recipe in meal['recipe']:
            convert_date(recipe, 'date_added')
            convert_date(recipe, 'date_modified')


def load_meal_data(args, db):
    meal_refs = db.collection_group(u'specificMeals')
    query_ref = meal_refs.where(u'used_in_camp', u'==', args.camp_id)
    specific_meals = list(map(lambda doc: convert_document(doc), query_ref.stream()))
    meal_refs = db.collection(u'meals')
    query_ref = meal_refs.where(u'used_in_camps', u'array_contains', args.camp_id)
    meals = list(map(lambda doc: convert_document(doc), query_ref.stream()))
    for meal in meals:
        for specMeal in specific_meals:
            if specMeal['meal_id'] == meal['doc_id']:
                specMeal['meal_name'] = meal['meal_name']
                specMeal['meal_description'] = meal['meal_description']
    return specific_meals


def load_camp_meta_data(args, db, test_case_data):
    test_case_data['camp_meta_info'] = db.document(u'camps/' + args.camp_id).get().to_dict()

    # convert dates
    convert_date(test_case_data['camp_meta_info'], 'date_modified')
    convert_date(test_case_data['camp_meta_info'], 'date_added')
    for day in test_case_data['camp_meta_info']['days']:
        convert_date(day, 'day_date')


def parse_args():
    """
        Parses the command line arguments
    """

    # Initialize parser
    msg = "Arguments for pdf export."
    parser = argparse.ArgumentParser(description=msg)

    # Adding arguments
    parser.add_argument('user_id', type=str, help='id of the user, used to check the quota')
    parser.add_argument('camp_id', type=str, help='id of the camp')

    # Read arguments from command line
    args = parser.parse_args()

    return args


def main():
    args = parse_args()
    test_case_data = {}

    # Init Database
    cred = credentials.Certificate('keys/cevizh11-firebase-adminsdk.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    # Load camp meta data
    load_camp_meta_data(args, db, test_case_data)
    specific_meals = load_meal_data(args, db)
    load_recipe_data(db, specific_meals, test_case_data)

    with open('tests/test_cases/' + args.camp_id + '.json', 'w') as json_file:
        json.dump(test_case_data, json_file)


if __name__ == '__main__':
    main()
