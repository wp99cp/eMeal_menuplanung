"""

    Decisions of the admins on the shopping list.

    The export logs the ingredients without a category and the spelling corrections to the document
    sharedData/foodCategories. In the admin dashboard of the frontend an admin works through them. The decisions
    are saved in the same document and apply on top of categories.csv, hence without a release:

    - categories: list of {food_item, category_name}, the category of a food item that is not in categories.csv
    - ignored: names that are no food items (e.g. typos), they are not logged again
    - acceptedCorrections: list of {from, to}, corrections that are fine, they are not logged again
    - rejectedCorrections: names that are spelled correctly, they are not corrected anymore

"""

DOCUMENT = 'sharedData/foodCategories'


class AdminDecisions:

    def __init__(self, data=None):
        """
        :param data: content of the document sharedData/foodCategories, entries of an unknown form are skipped
        """

        data = data or {}

        self.categories = {
            entry['food_item']: entry['category_name']
            for entry in _list(data, 'categories')
            if isinstance(entry, dict)
            and isinstance(entry.get('food_item'), str) and isinstance(entry.get('category_name'), str)
        }
        self.ignored = {name for name in _list(data, 'ignored') if isinstance(name, str)}
        self.accepted_corrections = {
            (entry.get('from'), entry.get('to'))
            for entry in _list(data, 'acceptedCorrections') if isinstance(entry, dict)
        }
        self.rejected_corrections = {name for name in _list(data, 'rejectedCorrections') if isinstance(name, str)}

    @classmethod
    def load(cls, db):
        """
        :param db: firestore client
        """

        return cls(db.document(DOCUMENT).get().to_dict())


def _list(data, field):
    value = data.get(field)
    return value if isinstance(value, list) else []
