require('dotenv').config();
const configProvider = require('./config.provider');

module.exports = {
  configProvider,
  NODE_ENV: configProvider.get('NODE_ENV', 'development'),
  PORT: configProvider.get('PORT', '3000'),
  LOG_LEVEL: configProvider.get('LOG_LEVEL', 'info'),
  DATABASE_URL: configProvider.get('DATABASE_URL'),
  REDIS_URL: configProvider.get('REDIS_URL', 'redis://localhost:6379'),
  JWT_SECRET: configProvider.get('JWT_SECRET', 'supersecret_dev_key'),
  JWT_EXPIRES_IN: configProvider.get('JWT_EXPIRES_IN', '15m'),
  JWT_REFRESH_SECRET: configProvider.get('JWT_REFRESH_SECRET', 'supersecret_refresh_key'),
  JWT_REFRESH_EXPIRES_IN: configProvider.get('JWT_REFRESH_EXPIRES_IN', '7d'),
};
