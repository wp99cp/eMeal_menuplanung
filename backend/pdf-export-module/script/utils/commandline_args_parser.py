import argparse


def setup_parser():
    # Initialize parser
    msg = "Arguments for pdf export."
    parser = argparse.ArgumentParser(description=msg)

    # Adding arguments
    parser.add_argument('user_id', type=str, help='id of the user, used to check the quota')
    parser.add_argument('camp_id', type=str, help='id of the camp')

    # Adding optional arguments
    parser.add_argument('--mp', help='Includes meals that get prepared in the weekview', default=False,
                        action='store_true')
    parser.add_argument('--mock_data', help='Uses mock data instead of fetching the data form the DB', default=False,
                        action='store_true')
    parser.add_argument('--dfn', help='Uses a default file name: /export.pdf (Should only be used for debugging).',
                        default=False, action='store_true')
    parser.add_argument('--lscp', help='Prints the weekview in landscape', default=False, action='store_true')
    parser.add_argument('--fdb', help='Includes a feedback form page for the participants of the camp', default=False,
                        action='store_true')
    parser.add_argument('--wv', help='Includes the weekview', default=False, action='store_true')
    parser.add_argument('--spl', help='Includes the shopping list', default=False, action='store_true')
    parser.add_argument('--meals', help='Includes the meals', default=False, action='store_true')
    parser.add_argument('--fdbmsg', help='Custom feedback message on the feedback page', default=False)

    return parser
