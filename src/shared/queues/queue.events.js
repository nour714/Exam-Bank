const { QueueEvents } = require('bullmq');
const { eventBus } = require('../events');
const queueFactory = require('./queue.factory');
const { QUEUES } = require('./queue.registry');

class GlobalQueueEvents {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Initialize listeners for all registered queues.
   */
  initialize() {
    for (const queueName of Object.values(QUEUES)) {
      const queueEvents = new QueueEvents(queueName, {
        connection: queueFactory.getConnection(),
      });

      // Map BullMQ events to our centralized EventBus
      queueEvents.on('waiting', ({ jobId }) => {
        eventBus.publish('job:waiting', { queue: queueName, jobId });
      });

      queueEvents.on('active', ({ jobId }) => {
        eventBus.publish('job:started', { queue: queueName, jobId });
      });

      queueEvents.on('progress', ({ jobId, data }) => {
        eventBus.publish('job:progress', { queue: queueName, jobId, progress: data });
      });

      queueEvents.on('completed', ({ jobId, returnvalue }) => {
        eventBus.publish('job:completed', { queue: queueName, jobId, result: returnvalue });
      });

      queueEvents.on('failed', ({ jobId, failedReason }) => {
        eventBus.publish('job:failed', { queue: queueName, jobId, reason: failedReason });
      });

      queueEvents.on('error', (err) => {
        console.error(`[QueueEvents] Error on ${queueName}:`, err);
      });

      this.listeners.set(queueName, queueEvents);
    }
  }

  async close() {
    for (const listener of this.listeners.values()) {
      await listener.close();
    }
  }
}

module.exports = new GlobalQueueEvents();
