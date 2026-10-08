import math

from utils.latex import printable

# defines order of meal types
meal_types = ['Zmorgen', 'Znüni', 'Zmittag', 'Zvieri', 'Znacht', 'Dessert', 'Leitersnack', 'Vorbereiten']

recipe_user_groups = ['all', 'non-vegetarians', 'vegetarians', 'leaders']


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


def meal_type_order(meal_type):
    """
    :return: sort key of a meal type, unknown types are sorted to the end
    """

    return meal_types.index(meal_type) if meal_type in meal_types else len(meal_types)


def to_text(value) -> str:
    """
    :return: the value as string without characters that can't be printed, an empty string if the value is missing
    """

    return '' if value is None else printable(str(value))


def to_number(value) -> float:
    """
    The frontend saves an emptied number field as null or NaN, old documents contain numbers as text.

    :return: the value as number, 0 if the value is missing or not a number
    """

    if isinstance(value, bool):
        return 0

    if isinstance(value, str):
        try:
            value = float(value.strip().replace(',', '.'))
        except ValueError:
            return 0

    if not isinstance(value, (int, float)) or not math.isfinite(value):
        return 0

    return value


def is_number(value) -> bool:
    """
    :return: True if the value is a usable number, False e.g. for an emptied number field
    """

    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def to_count(value) -> int:
    """
    :return: the value as a number of persons, i.g. a non-negative integer
    """

    return max(0, round(to_number(value)))


def normalize_camp(camp: dict):
    """
    Fills in the fields of a camp the export relies on. The documents in the database are not guaranteed to be
    complete: fields were added over time and the frontend saves emptied fields as null.
    """

    camp['camp_name'] = to_text(camp.get('camp_name'))

    for field in ['camp_participants', 'camp_vegetarians', 'camp_leaders']:
        camp[field] = to_count(camp.get(field))

    camp['days'] = [day for day in camp.get('days') or [] if day.get('day_date') is not None]
    for day in camp['days']:
        day['day_description'] = to_text(day.get('day_description'))


def normalize_specific_meal(meal: dict):
    """
    Fills in the fields of a specific meal the export relies on, see normalize_camp.
    """

    meal['meal_weekview_name'] = to_text(meal.get('meal_weekview_name'))
    meal['meal_used_as'] = to_text(meal.get('meal_used_as'))
    # without a number of participants the ones of the camp are used
    meal['meal_override_participants'] = bool(meal.get('meal_override_participants')) \
                                         and is_number(meal.get('meal_participants'))
    meal['meal_participants'] = to_count(meal.get('meal_participants'))

    # a meal can only be prepared if the date is known
    meal['meal_prepare_date'] = meal.get('meal_prepare_date')
    meal['meal_gets_prepared'] = bool(meal.get('meal_gets_prepared')) and meal['meal_prepare_date'] is not None

    for recipe in meal.get('recipe') or []:
        normalize_recipe(recipe)


def normalize_meal_data(meal: dict):
    """
    Fills in the fields a specific meal gets from its meal. The meal is unknown, if the camp is missing in the
    field `used_in_camps` of the meal. In this case the name of the weekview is used.
    """

    meal['meal_name'] = to_text(meal.get('meal_name')) or meal.get('meal_weekview_name', '')
    meal['meal_description'] = to_text(meal.get('meal_description'))


def normalize_recipe(recipe: dict):
    """
    Fills in the fields of a recipe and of its ingredients the export relies on, see normalize_camp.
    """

    for field in ['recipe_name', 'recipe_description', 'recipe_notes']:
        recipe[field] = to_text(recipe.get(field))

    ingredients = [ing for ing in recipe.get('ingredients') or [] if isinstance(ing, dict)]

    for ing in ingredients:
        ing['food'] = to_text(ing.get('food')).strip()
        ing['unit'] = to_text(ing.get('unit')).strip()
        ing['comment'] = to_text(ing.get('comment'))
        ing['fresh'] = bool(ing.get('fresh'))
        ing['measure'] = to_number(ing.get('measure'))

    # filter out ingredients with empty food value
    recipe['ingredients'] = [ing for ing in ingredients if ing['food'] != '']

    if recipe.get('recipe_used_for') not in recipe_user_groups:
        recipe['recipe_used_for'] = 'all'

    # without a number of participants the ones of the meal are used
    recipe['recipe_override_participants'] = bool(recipe.get('recipe_override_participants')) \
                                             and is_number(recipe.get('recipe_participants'))
    recipe['recipe_participants'] = to_count(recipe.get('recipe_participants'))


def overwrite_ingredients(ingredients: list, overwrites: list) -> list:
    """
    Applies the overwrites of a camp to the ingredients of a recipe, as the frontend does: an ingredient with the
    `unique_id` of an existing one replaces it, all others get added.

    :return: the ingredients of the recipe inside the camp
    """

    ingredients = list(ingredients or [])
    positions = {ing.get('unique_id'): i for i, ing in enumerate(ingredients) if isinstance(ing, dict)}

    for ing in overwrites or []:
        if not isinstance(ing, dict):
            continue

        unique_id = ing.get('unique_id')
        if unique_id is not None and unique_id in positions:
            ingredients[positions[unique_id]] = ing
        else:
            ingredients.append(ing)

    return ingredients
