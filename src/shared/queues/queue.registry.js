const queueFactory = require('./queue.factory');

const QUEUES = {
  AI: 'ai-jobs',
  OCR: 'ocr-jobs',
  NOTIFICATIONS: 'notifications-jobs',
  EMAILS: 'emails-jobs',
  IMAGES: 'image-processing-jobs',
  SEARCH: 'search-indexing-jobs',
  STATS: 'statistics-jobs',
  REPORTS: 'report-generation-jobs',
  WEBHOOKS: 'webhook-deliveries-jobs',
  PLUGINS: 'plugin-tasks-jobs',
};

class QueueRegistry {
  constructor() {
    this.queues = new Map();
    this._initializeQueues();
  }

  _initializeQueues() {
    for (const [key, name] of Object.entries(QUEUES)) {
      this.queues.set(name, queueFactory.createQueue(name));
    }
  }

  getQueue(name) {
    const queue = this.queues.get(name);
    if (!queue) {
      throw new Error(`Queue '${name}' is not registered.`);
    }
    return queue;
  }
}

module.exports = {
  QUEUES,
  queueRegistry: new QueueRegistry(),
};
