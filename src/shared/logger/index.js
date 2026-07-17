const pino = require('pino');
const pinoHttp = require('pino-http');
const config = require('../config');

// Base logger configuration
const logger = pino({
  level: config.LOG_LEVEL || 'info',
  transport: config.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  } : undefined,
});

// HTTP Request logger middleware
const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.headers['x-request-id'] || req.id,
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  autoLogging: {
    ignore: (req) => req.url === '/health' || req.url === '/metrics',
  },
});

module.exports = {
  logger,
  httpLogger,
};
