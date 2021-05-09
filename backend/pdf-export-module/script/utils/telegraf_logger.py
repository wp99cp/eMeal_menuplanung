import json
from datetime import datetime
from logging import StreamHandler

import pandas as pd
from influxdb import DataFrameClient


class TelegrafLogger(StreamHandler):

    def __init__(self):
        StreamHandler.__init__(self)

        with open('keys/influx_settings.json') as json_file:
            data = json.load(json_file)

            self.client = DataFrameClient(host=data.get("host"), port=data.get("port"), username=data.get("username"),
                                          password=data.get("password"))
            self.client.switch_database(data.get("database"))

    def emit(self, record):
        # initialize list of lists
        data = [[record.getMessage(), record.lineno, record.funcName, record.exc_info]]
        df = pd.DataFrame(data, columns=['log_message', 'lineno', 'funcName', 'exc_info'], index=[datetime.utcnow()])
        self.client.write_points(measurement="camp_export", dataframe=df, tags={"log_level": record.levelname})
