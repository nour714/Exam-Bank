const { Worker } = require('bullmq');
const queueFactory = require('../queues/queue.factory');

/**
 * BaseWorker Class
 * Standardizes background processing. Enforces logging, metrics, error handling,
 * and graceful shutdown.
 */
class BaseWorker {
  /**
   * @param {string} queueName - Use QUEUES enum from queue.registry
   * @param {number} concurrency - How many jobs to process in parallel
   */
  constructor(queueName, concurrency = 1) {
    if (this.constructor === BaseWorker) {
      throw new Error('BaseWorker is abstract and cannot be instantiated directly.');
    }

    this.queueName = queueName;
    this.concurrency = concurrency;
    this.worker = null;
  }

  /**
   * Must be implemented by child classes.
   * @param {import('bullmq').Job} job
   */
  async processJob(job) {
    throw new Error('processJob() must be implemented.');
  }

  /**
   * Start the worker listening to the queue.
   */
  start() {
    console.log(`[Worker] Starting ${this.constructor.name} on queue '${this.queueName}' (Concurrency: ${this.concurrency})`);
    
    this.worker = new Worker(
      this.queueName,
      async (job) => {
        const start = Date.now();
        console.log(`[${this.constructor.name}] Job ${job.id} started.`);
        
        try {
          const result = await this.processJob(job);
          const duration = Date.now() - start;
          console.log(`[${this.constructor.name}] Job ${job.id} completed in ${duration}ms.`);
          return result;
        } catch (error) {
          console.error(`[${this.constructor.name}] Job ${job.id} failed:`, error);
          throw error; // Let BullMQ handle retries and Dead Letter Queue
        }
      },
      {
        connection: queueFactory.getConnection(),
        concurrency: this.concurrency,
      }
    );

    // Health monitoring hooks could be added here
    this.worker.on('error', err => {
      console.error(`[${this.constructor.name}] System Error:`, err);
    });
  }

  /**
   * Graceful shutdown for deployments.
   */
  async close() {
    if (this.worker) {
      console.log(`[Worker] Shutting down ${this.constructor.name}...`);
      await this.worker.close();
    }
  }
}

module.exports = BaseWorker;
