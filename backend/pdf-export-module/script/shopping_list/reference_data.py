import csv
from pathlib import Path

"""

    Reference data of the shopping list.

    The food categories and the unit conversions are files of this module and therefore part of the image:
    a change is a commit, no database is involved.

    - categories.csv: food_item, category_name, spelling_reference ("yes" or empty)
    - units.csv: unit_from, base_unit, factor, only_for_food_item

"""

_DATA_DIR = Path(__file__).parent


def _read_csv(file_name):
    with open(_DATA_DIR / file_name, newline='', encoding='utf-8') as file:
        return list(csv.DictReader(file))


def load_categories():
    """
    :return: a dict mapping the name of a food item to the name of its category
    """

    return {row['food_item']: row['category_name'] for row in _read_csv('categories.csv')}


def load_spelling_references():
    """
    Many food items are listed as the users typed them, including their typos. Only the names
    marked as a spelling reference are used to correct the spelling of an ingredient.

    :return: the set of the names of all food items that are a spelling reference
    """

    return {row['food_item'] for row in _read_csv('categories.csv') if row['spelling_reference'] == 'yes'}


def load_unit_conversions():
    """
    :return: a dict mapping "<unit_from>:<only_for_food_item>" to its conversion, a dict with the fields
        base_unit, factor and only_for_food_item. For a general conversion only_for_food_item is empty.
    """

    return {
        row['unit_from'] + ':' + row['only_for_food_item']: {
            'base_unit': row['base_unit'],
            'factor': float(row['factor']),
            'only_for_food_item': row['only_for_food_item']
        } for row in _read_csv('units.csv')
    }
