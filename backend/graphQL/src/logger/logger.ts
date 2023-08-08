import winston, { format, transports } from 'winston';
import LokiTransport from 'winston-loki';

const messageOnly = format.printf(({ level, message }) => {
  return `[${level.toUpperCase()}]: ${message}`;
});

const logger = winston.createLogger({
  level: 'debug',
  levels: winston.config.npm.levels,
  format: winston.format.json(),
  transports: [
    new transports.Console({ format: messageOnly }),
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

export default logger as winston.Logger;
