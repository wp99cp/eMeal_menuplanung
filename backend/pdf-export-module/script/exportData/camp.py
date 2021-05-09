from datetime import timedelta

from pylatex import NoEscape

from script.exportData.data_fetcher import DataFetcher, meal_types
from script.exportData.ingredients_calculator import IngredientsCalculator


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

        if not self._user_data_fetched:
            self._fetch_user_data()

        return self._user_data.get('displayName')

    def get_camp_name(self):
        """
        :return: The full name of the camp
        """

        if not self._camp_meta_info_fetched:
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

        if not self._specific_meals_loaded:
            self._fetch_specific_meals()

        # includes only meals types actually used; Zmorgen, Zmittag, and Znacht are always included
        self._used_meal_types = ['Zmorgen', 'Zmittag', 'Znacht'] + list(
            map(lambda m: m.get('meal_used_as'), self._specific_meals))

        # add Vorbereiten if used
        if self.args.mp:
            for meal in self._specific_meals:
                if meal.get('meal_gets_prepared'):
                    self._used_meal_types += ['Vorbereiten']
                    break

        self._used_meal_types = sorted(self._used_meal_types, key=lambda x: meal_types.index(x))

        return self._used_meal_types

    def get_meals_for_weekview(self):
        if not self._specific_meals_loaded:
            self._fetch_specific_meals()

        day_as_dates = list(map(lambda d: d['day_date'], self._camp_meta_info.get('days')))

        meal_weekview = {}
        for meal_type in self.get_meal_type_names():
            meal_weekview[meal_type] = [NoEscape('')] * len(day_as_dates)

        for meal in self._specific_meals:
            meal_weekview.get(meal.get('meal_used_as'))[day_as_dates.index(meal.get('meal_date'))] += NoEscape(
                r'\centering ' + meal.get('meal_weekview_name') + r' \par ')

            if meal.get('meal_gets_prepared') and self.args.mp:

                prepare_date = meal.get('meal_prepare_date')

                if prepare_date in day_as_dates:
                    day_index = day_as_dates.index(prepare_date)
                    meal_weekview.get('Vorbereiten')[day_index] += \
                        NoEscape(
                            r'\centering ' + meal.get(
                                'meal_weekview_name') + r" \par \vspace{0.1cm} "
                                                        r" {\tiny \textit{für " +
                            (meal.get('meal_prepare_date') + timedelta(hours=2)).strftime(
                                "%A") + r'}} \vspace{0.20cm} \par')

        return meal_weekview

    def get_meal_names_for_feedback(self):

        if not self._specific_meals_loaded:
            self._fetch_specific_meals()

        if not self._meals_loaded:
            self._fetch_meals()

        return self._specific_meals

    def get_meals_for_meal_page(self):
        if not self._specific_meals_loaded:
            self._fetch_specific_meals()

        if not self._meals_loaded:
            self._fetch_meals()

        if not self._recipes_loaded:
            self._fetch_recipes()

        self._calc_measurements()

        return self._specific_meals

    def get_days(self):
        if not self._camp_meta_info_fetched:
            self._fetch_camp_meta_data()

        def date_to_str(day):
            return (day['day_date'] + timedelta(hours=2)).strftime("%A, %d. %b %Y")

        days = list(map(date_to_str, self._camp_meta_info.get('days')))

        return days
