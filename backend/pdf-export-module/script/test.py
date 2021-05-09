import copy
import datetime
import random
import unittest

from utils.commandline_args_parser import setup_parser
from exportData.camp import Camp
from pdf_generator import create_pdf


class TestSum(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Set commandline arguments
        parser = setup_parser()
        args = parser.parse_args(['None', 'None', '--mock_data'])

        cls.camp = Camp(args=args)

        cls.user_data = {'displayName': 'Maximilian Mastermind'}
        cls.camp_meta_info = {'camp_name': 'Sommerlager 2021 - Testlager',
                              'days': [
                                  {'day_description': 'Day 1', 'day_notes': '',
                                   'day_date': datetime.datetime(year=2021, day=21, month=5)},
                                  {'day_description': 'Day 2', 'day_notes': '',
                                   'day_date': datetime.datetime(year=2021, day=22, month=5)},
                                  {'day_description': 'Day 3', 'day_notes': '',
                                   'day_date': datetime.datetime(year=2021, day=23, month=5)},
                                  {'day_description': 'Day 4', 'day_notes': '',
                                   'day_date': datetime.datetime(year=2021, day=25, month=5)},
                                  {'day_description': 'Day 5', 'day_notes': '',
                                   'day_date': datetime.datetime(year=2021, day=26, month=5)}
                              ]}

        cls.camp.setMockData(cls.user_data, None, cls.camp_meta_info, None)

    def test_camp_name(self):
        self.assertEqual('Sommerlager 2021 - Testlager', self.camp.get_camp_name())

    def test_author_name(self):
        self.assertEqual('Maximilian Mastermind', self.camp.get_full_author_name())

    def test_day_sort_order(self):
        # shuffle days
        camp_meta = copy.deepcopy(self.camp_meta_info)
        random.shuffle(camp_meta['days'])

        self.camp.setMockData(self.user_data, None, camp_meta, None)
        self.assertEqual(self.camp_meta_info['days'], self.camp.get_days())

    def test_pdf_creation(self):
        # Set commandline arguments
        parser = setup_parser()
        args = parser.parse_args(['None', 'None', '--mock_data', '--dfn'])

        create_pdf(self.camp, args)


if __name__ == '__main__':
    unittest.main()
