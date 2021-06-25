from collections import Counter


class SpellingCorrector:

    def __init__(self, db):

        self.__db = db

        # Load all known food names
        food_dictionary = self.__db.document('sharedData/categories').get().to_dict().keys()
        self._WORDS = Counter(food_dictionary)

    def fix_spelling_mistakes(self, ingredients):
        for ing in ingredients:
            ing['food'] = self._correction(ing['food'])

    def _P(self, word, n=None):
        """
        Probability of `word`.
        """

        if n is None:
            n = sum(self._WORDS.values())

        return self._WORDS[word] / n

    def _correction(self, word):
        """
        Most probable spelling correction for word.
        """

        return max(self._candidates(word), key=self._P)

    def _candidates(self, word):
        """
        Generate possible spelling corrections for word.
        """

        return self._known([word]) or self._known(self._edits1(word)) or self._known(self._edits2(word)) or [word]

    def _known(self, wds):
        """
        The subset of `words` that appear in the dictionary of WORDS.
        """

        return set(w for w in wds if w in self._WORDS)

    def _edits1(self, word):
        """
        All edits that are one edit away from `word`.
        """

        letters = 'abcdefghijklmnopqrstuvwxyz'
        splits = [(word[:i], word[i:]) for i in range(len(word) + 1)]
        deletes = [L + R[1:] for L, R in splits if R]
        transposes = [L + R[1] + R[0] + R[2:] for L, R in splits if len(R) > 1]
        replaces = [L + c + R[1:] for L, R in splits if R for c in letters]
        inserts = [L + c + R for L, R in splits for c in letters]
        return set(deletes + transposes + replaces + inserts)

    def _edits2(self, word):
        """
        All edits that are two edits away from `word`.
        """

        return (e2 for e1 in self._edits1(word) for e2 in self._edits1(e1))
