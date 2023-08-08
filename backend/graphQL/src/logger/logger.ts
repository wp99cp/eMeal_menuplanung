import winston, { format, transports } from 'winston';
import LokiTransport from 'winston-loki';

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [
    new transports.Console({
      format: winston.format.combine(format.simple(), format.colorize()),
    }),
    new LokiTransport({
      host: 'http://loki:3100',
      interval: 5,
      labels: {
        job: 'graphQL-backend',
      },
      json: true,
      format: format.json(),
      replaceTimestamp: true,
    }),
  ],
});

export default logger;
