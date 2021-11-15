from exportData.data_fetcher import DataFetcher, meal_types
from exportData.ingredients_calculator import IngredientsCalculator


class Camp(IngredientsCalculator, DataFetcher):
    """

    Represents a camp in the database.

    This class should be used as an abstract interface for accessing camp data during exporting a camp. Fetching data is
    performed in a lazy mode, i.g., data gets only fetched if requested.

    * ------------------------------------- *
    |              PDF creator              |
    * ------------------------------------- *
    |           this class `Camp`           |
    * ------------------------------------- *

    * ------------------------------------- *
    |           Firebase Database           |
    * ------------------------------------- *

    All database accesses are managed though this call.

    """

    def get_full_author_name(self):
        """
        :return: name of the current user, the author of the export
        """

        self._fetch_user_data()

        return self._user_data.get('displayName')

    def get_camp_name(self):
        """
        :return: The full name of the camp
        """

        self._fetch_camp_meta_data()

        return self._camp_meta_info.get('camp_name')

    def get_meal_type_names(self):
        """

        Creates a list of all used meal type names. The resulting list is ordered
        according as follows: Zmorgen, Znüni, Zmittag, Zvieri, Znacht, Leitersnack,
        Vorbereiten. The three main meals, i.g., Zmorgen, Zmittag, Znacht, are always included.

        :return: an array of meal type names.
        """

        if self._used_meal_types:
            return self._used_meal_types

        self._fetch_specific_meals()

        # includes only meals types actually used; Zmorgen, Zmittag, and Znacht are always included
        self._used_meal_types = ['Zmorgen', 'Zmittag', 'Znacht'] + list(
            map(lambda m: m.get('meal_used_as'), self._specific_meals))

        # add "Vorbereiten" if used
        if self.args.mp:
            for meal in self._specific_meals:
                if meal.get('meal_gets_prepared'):
                    self._used_meal_types += ['Vorbereiten']
                    break

        self._used_meal_types = sorted(self._used_meal_types, key=lambda x: meal_types.index(x))

        return self._used_meal_types

    def get_meals_for_weekview(self):

        self._fetch_specific_meals()

        return self._specific_meals

    def get_meal_names_for_feedback(self):

        self._fetch_specific_meals()
        self._fetch_meals()

        return self._specific_meals

    def get_specific_meals(self):
        self._fetch_specific_meals()
        self._fetch_meals()
        self._fetch_recipes()

        self._calc_measurements()

        return self._specific_meals

    def get_days(self):
        self._fetch_camp_meta_data()

        return self._camp_meta_info.get('days')

    def get_TN_description(self):

        self._fetch_camp_meta_data()

        return r'Anzahl TNs {} (davon Leiter {} bzw. Vegetarier {})'.format(
            self._camp_meta_info['camp_participants'],
            self._camp_meta_info['camp_leaders'],
            self._camp_meta_info['camp_vegetarians']
        )

    def get_days_as_dates(self):
        return list(map(lambda d: d['day_date'], self.get_days()))
