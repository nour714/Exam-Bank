const { Queue } = require('bullmq');
const { configProvider } = require('../config');
// import IORedis from 'ioredis';

class QueueFactory {
  constructor() {
    this.connection = null;
  }

  /**
   * Get the singleton Redis connection used strictly for queues.
   */
  getConnection() {
    if (!this.connection) {
      // In production:
      // const redisUrl = configProvider.get('REDIS_URL', 'redis://localhost:6379');
      // this.connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
      this.connection = { mock: true }; // Mocked for phase 8 implementation
    }
    return this.connection;
  }

  /**
   * Create a standard BullMQ queue with enterprise default options.
   * @param {string} queueName
   */
  createQueue(queueName) {
    return new Queue(queueName, {
      connection: this.getConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100, // Keep last 100 successful jobs for metrics
        removeOnFail: 500,     // Keep last 500 failed jobs for debugging
      },
    });
  }
}

module.exports = new QueueFactory();
