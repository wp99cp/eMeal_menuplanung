import json
from logging import StreamHandler


class TelegrafLogger(StreamHandler):

    def __init__(self):
        StreamHandler.__init__(self)

        with open('../keys/influx/influx_settings.json') as json_file:
            data = json.load(json_file)

    def emit(self, record):
        # initialize list of lists
        data = [[record.getMessage(), record.lineno, record.funcName, record.exc_info]]

        # TODO: fix logger
        # self.client.write_points(measurement="camp_export", dataframe=df, tags={"log_level": record.levelname})
