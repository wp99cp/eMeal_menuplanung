import re
from collections import Counter

from exportData.camp import Camp

"""

     Shopping List

     * -------- *
     |          | - *
     |  meals   |   |    ==>   fixing spelling mistakes       <--     Load list of ingredients form DB
     |          |   |          (using editing distance)
     * -------- *   |
        * --------- *                   ||
                                        VV

                                combining ingredients and    ==>    * -------- *
                                   transforming units               |          | - *    A) Complete shopping list
                                                                    | shopping |   |       -> containing all ingredients
                                                                    |  lists   |   |
                                                                    |          |   |    B) Basic List (first day)
                                                                    |          |   |       and daily lists with fresh
                                                                    * -------- *   |       products
                                                                       * --------- *


    Basic idea: Creating the shopping lists is a multi stage process. For each type of shopping
    list we walk through the following steps.

    (1) We fix spelling mistakes in the ingredients of each meal. Using minimal editing distance.

    (2) We now can combine the ingredients. Note: We only combine ingredients spelled exactly the same
        but including the fixes from step (1). For calculating the sums accordingly, we convert all
        units to ISO-base units (e.g. milliliters to liters). For some ingredients, e.g. for water,
        we also can convert between units.

    (3) Next, we check if the word is in the list of known ingredients. For that we convert the name of the
        ingredient to lower case. If so, we can return the corresponding category. If no category found, we
        check for related ingredients in our database and check if a sub-word is in known category.
        Unknown ingredients get logged for manual categorising. In the shopping list the get shown under
        the "uncategorized" category.

"""


class ShoppingList:
    """
    Helper class for creating a shopping list form a camp.
    """

    def __init__(self, camp: Camp):
        self.camp


def words(text):
    return re.findall(r'\w+', text.lower())


WORDS = Counter(words(open('big.txt').read()))


def P(word, n=sum(WORDS.values())):
    """Probability of `word`."""
    return WORDS[word] / n


def correction(word):
    """Most probable spelling correction for word."""
    return max(candidates(word), key=P)


def candidates(word):
    """Generate possible spelling corrections for word."""
    return known([word]) or known(edits1(word)) or known(edits2(word)) or [word]


def known(wds):
    """The subset of `words` that appear in the dictionary of WORDS."""
    return set(w for w in wds if w in WORDS)


def edits1(word):
    """All edits that are one edit away from `word`."""
    letters = 'abcdefghijklmnopqrstuvwxyz'
    splits = [(word[:i], word[i:]) for i in range(len(word) + 1)]
    deletes = [L + R[1:] for L, R in splits if R]
    transposes = [L + R[1] + R[0] + R[2:] for L, R in splits if len(R) > 1]
    replaces = [L + c + R[1:] for L, R in splits if R for c in letters]
    inserts = [L + c + R for L, R in splits for c in letters]
    return set(deletes + transposes + replaces + inserts)


def edits2(word):
    """All edits that are two edits away from `word`."""
    return (e2 for e1 in edits1(word) for e2 in edits1(e1))


# test run
print(correction('Schwarzwurtzell'))
