require('dotenv').config();
const configProvider = require('./config.provider');

// Validate critical secrets exist
const NODE_ENV = configProvider.get('NODE_ENV', 'development');
const JWT_SECRET = configProvider.get('JWT_SECRET');
const JWT_REFRESH_SECRET = configProvider.get('JWT_REFRESH_SECRET');

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  console.error('[SECURITY CRITICAL] JWT_SECRET or JWT_REFRESH_SECRET is not set. This is a security risk in production!');
}

module.exports = {
  configProvider,
  NODE_ENV,
  PORT: configProvider.get('PORT', '3000'),
  LOG_LEVEL: configProvider.get('LOG_LEVEL', 'info'),
  DATABASE_URL: configProvider.get('DATABASE_URL'),
  REDIS_URL: configProvider.get('REDIS_URL', 'redis://localhost:6379'),
  JWT_SECRET: JWT_SECRET || 'dev_only_insecure_key_do_not_use_in_production',
  JWT_EXPIRES_IN: configProvider.get('JWT_EXPIRES_IN', '15m'),
  JWT_REFRESH_SECRET: JWT_REFRESH_SECRET || 'dev_only_insecure_refresh_key_do_not_use_in_production',
  JWT_REFRESH_EXPIRES_IN: configProvider.get('JWT_REFRESH_EXPIRES_IN', '7d'),
};
