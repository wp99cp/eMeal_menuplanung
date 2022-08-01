import difflib

from Levenshtein import distance as lev
from google.cloud import firestore


class SpellingCorrector:

    def __init__(self, db):

        self.__db = db

        # Load all known food names
        food_dictionary = self.__db.document('sharedData/categories').get().to_dict().keys()
        self._WORDS = food_dictionary

    def fix_spelling_mistakes(self, ingredients):
        correction_logs = []
        for ing in ingredients:
            ing['food'], correction_log = self._correction(ing['food'])

            if correction_log is not None:
                correction_logs.append(correction_log)

        if correction_logs and len(correction_logs) > 0:
            self.__db.document('sharedData/foodCategories').update(
                {"resentCorrections": firestore.ArrayUnion(correction_logs)})

    def _correction(self, input_word):
        """
        Most probable spelling correction for word.
        """

        # Nothing to correct
        if input_word in self._WORDS:
            return input_word, None

        # Check if special characters are present in the word
        if any(s in input_word for s in ['\\&']):
            return input_word, None

        # Try to find a close match
        new_words = difflib.get_close_matches(input_word, self._WORDS, n=1, cutoff=0.2)

        # The word is unknown
        if len(new_words) == 0 or lev(input_word, new_words[0]) >= 2:
            return input_word, None

        new_word = new_words[0]
        return new_word, {"from": input_word, "to": new_word}
