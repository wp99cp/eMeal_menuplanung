from exportData.data_fetcher import DataFetcher


class IngredientsCalculator(DataFetcher):
    def _calc_measurements(self):
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

        # The calculation changes the participants of the recipes in place, hence it must run only once. The
        # shopping list and the pages of the meals both request the measurements.
        if self._measurements_calculated:
            return

        if not self._camp_meta_info_fetched:
            self._fetch_camp_meta_data()

        for meal in self._specific_meals:

            if not meal['meal_override_participants']:
                meal['meal_participants'] = self._camp_meta_info['camp_participants']

            if 'recipe' in meal:
                for recipe in meal['recipe']:

                    if not recipe['recipe_override_participants']:
                        recipe['recipe_participants'] = meal['meal_participants']

                    if recipe['recipe_used_for'] == 'all':
                        pass
                    elif recipe['recipe_used_for'] == 'non-vegetarians':
                        recipe['recipe_participants'] -= self._camp_meta_info['camp_vegetarians']

                    # 'vegetarians' and 'leaders' will never been overwritten
                    elif recipe['recipe_used_for'] == 'vegetarians':
                        recipe['recipe_participants'] = self._camp_meta_info['camp_vegetarians']
                    elif recipe['recipe_used_for'] == 'leaders':
                        recipe['recipe_participants'] = self._camp_meta_info['camp_leaders']

                    else:
                        raise Exception(
                            "Unknown used_for value! The used_for value must be in ['all', 'non-vegetarians',"
                            "'vegetarians', 'leaders']. But used_for was " + str(recipe['recipe_used_for']))

                    # e.g. a meal for fewer persons than the camp has vegetarians
                    recipe['recipe_participants'] = max(0, recipe['recipe_participants'])

                    for ing in recipe['ingredients']:

                        if ing['measure']:
                            ing['measure'] = float(ing['measure'])
                            ing['measure_calc'] = float(ing['measure']) * recipe['recipe_participants']

                        else:
                            ing['measure'] = 0
                            ing['measure_calc'] = 0

        self._measurements_calculated = True
