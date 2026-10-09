import difflib

from Levenshtein import distance as lev
from google.cloud import firestore


class SpellingCorrector:

    def __init__(self, db, food_dictionary, keep=(), reviewed=()):
        """
        :param db: firestore client, used to log the corrections
        :param food_dictionary: the correctly spelled food names
        :param keep: names that are never corrected
        :param reviewed: corrections as tuples (from, to) that are not logged anymore
        """

        self.__db = db
        self._WORDS = set(food_dictionary)
        self._keep = set(keep)
        self._reviewed = set(reviewed)

    def fix_spelling_mistakes(self, ingredients):
        correction_logs = []
        for ing in ingredients:
            ing['food'], correction_log = self._correction(ing['food'])

            if correction_log is not None and (correction_log['from'], correction_log['to']) not in self._reviewed:
                correction_logs.append(correction_log)

        if correction_logs and len(correction_logs) > 0:
            self.__db.document('sharedData/foodCategories').set(
                {"resentCorrections": firestore.ArrayUnion(correction_logs)}, merge=True)

    def _correction(self, input_word):
        """
        Most probable spelling correction for word.
        """

        # Nothing to correct
        if input_word in self._WORDS or input_word in self._keep:
            return input_word, None

        # Check if special characters are present in the word
        if any(s in input_word for s in ['&']):
            return input_word, None

        # Try to find a close match
        new_words = difflib.get_close_matches(input_word, self._WORDS, n=1, cutoff=0.2)

        # The word is unknown
        if len(new_words) == 0 or lev(input_word, new_words[0]) >= 2:
            return input_word, None

        new_word = new_words[0]
        return new_word, {"from": input_word, "to": new_word}
