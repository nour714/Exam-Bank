/**
 * QueueProvider — abstract base class for background job queue providers.
 * Concrete providers (e.g. BullMQProvider) must implement these methods.
 */
class QueueProvider {
  /**
   * Add a job to a queue.
   * @param {string} queueName
   * @param {string} jobName
   * @param {Object} payload
   * @param {Object} [options]
   * @returns {Promise<Object>} { jobId, queueName, timestamp }
   */
  async addJob(queueName, jobName, payload, options = {}) {
    throw new Error('Method not implemented.');
  }

  /**
   * Get job counts/metrics for a queue.
   * @param {string} queueName
   * @returns {Promise<Object>} { waiting, active, completed, failed, delayed }
   */
  async getQueueMetrics(queueName) {
    throw new Error('Method not implemented.');
  }

  /**
   * Register a worker/processor for a queue.
   * @param {string} queueName
   * @param {Function} processor
   * @param {Object} [options]
   */
  createWorker(queueName, processor, options = {}) {
    throw new Error('Method not implemented.');
  }

  /**
   * Gracefully close all queues, workers, and listeners.
   * @returns {Promise<void>}
   */
  async shutdown() {
    throw new Error('Method not implemented.');
  }
}

module.exports = QueueProvider;
