require('dotenv').config();
const app = require('./src/app');
const { logger } = require('./src/shared/logger');
const config = require('./src/shared/config');

const PORT = config.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${config.NODE_ENV} mode`);
});

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err) => {
  logger.fatal(err, 'UNHANDLED REJECTION! Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM RECEIVED. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated!');
  });
});
