const { queueRegistry, QUEUES } = require('./queue.registry');

class QueueManager {
  /**
   * Add a job to a specific queue.
   * Business modules use this to enqueue background work.
   * 
   * @param {string} queueName - Use QUEUES enum (e.g. QUEUES.EMAILS)
   * @param {string} jobName - e.g., 'send-welcome-email'
   * @param {Object} payload - Data for the worker
   * @param {Object} [options] - BullMQ job options (delay, priority, etc)
   */
  async addJob(queueName, jobName, payload, options = {}) {
    const queue = queueRegistry.getQueue(queueName);
    const job = await queue.add(jobName, payload, options);
    return job;
  }

  /**
   * Schedule a recurring job (Cron).
   */
  async addRecurringJob(queueName, jobName, payload, cronExpression) {
    const queue = queueRegistry.getQueue(queueName);
    return queue.add(jobName, payload, {
      repeat: { pattern: cronExpression },
    });
  }

  /**
   * Pause a queue from processing.
   */
  async pauseQueue(queueName) {
    const queue = queueRegistry.getQueue(queueName);
    await queue.pause();
  }

  /**
   * Resume a paused queue.
   */
  async resumeQueue(queueName) {
    const queue = queueRegistry.getQueue(queueName);
    await queue.resume();
  }

  /**
   * Get queue metrics for dashboard.
   */
  async getMetrics(queueName) {
    const queue = queueRegistry.getQueue(queueName);
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }
}

module.exports = {
  queueManager: new QueueManager(),
  QUEUES,
};
