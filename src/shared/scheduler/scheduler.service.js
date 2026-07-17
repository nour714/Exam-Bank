const cron = require('node-cron');
const { queueManager, QUEUES } = require('../queues');
const lockService = require('../reliability/lock.service');

/**
 * Centralized Cron Scheduler.
 *
 * It uses node-cron to trigger jobs based on time.
 * Crucially, to support horizontal scaling, it uses LockService to ensure
 * only ONE instance of the API server dispatches the background task.
 * 
 * It does NOT execute business logic directly. It simply enqueues a job
 * into BullMQ, handing it off to the Worker cluster.
 */
class SchedulerService {
  constructor() {
    this.tasks = [];
  }

  /**
   * Start the scheduler background process.
   */
  start() {
    console.log('[Scheduler] Starting centralized cron tasks...');
    
    // 1. Daily Reports (Every day at 00:00)
    this._schedule('0 0 * * *', 'daily_reports', async () => {
      await queueManager.addJob(QUEUES.REPORTS, 'generate-daily-reports', { timestamp: Date.now() });
    });

    // 2. Expired Session Cleanup (Every hour)
    this._schedule('0 * * * *', 'session_cleanup', async () => {
      await queueManager.addJob(QUEUES.STATS, 'cleanup-expired-sessions', {});
    });

    // 3. Search Reindexing (Every Sunday at 02:00)
    this._schedule('0 2 * * 0', 'search_reindex', async () => {
      await queueManager.addJob(QUEUES.SEARCH, 'full-reindex', {});
    });

    // 4. Billing Synchronization (Every day at 01:00)
    this._schedule('0 1 * * *', 'billing_sync', async () => {
      await queueManager.addJob(QUEUES.STATS, 'sync-billing-status', {});
    });

    // 5. Notification Reminders (Every 15 minutes)
    this._schedule('*/15 * * * *', 'notification_reminders', async () => {
      await queueManager.addJob(QUEUES.NOTIFICATIONS, 'process-reminders', {});
    });
  }

  /**
   * Schedule a task wrapped in a Distributed Lock.
   */
  _schedule(cronExpression, lockName, actionFn) {
    const task = cron.schedule(cronExpression, async () => {
      // TTL ensures the lock automatically drops if this process crashes
      const lockToken = await lockService.acquire(`cron:${lockName}`, 60000);
      
      if (!lockToken) {
        // Another instance is already handling this cron tick. Safely ignore.
        return;
      }

      try {
        console.log(`[Scheduler] Dispatching cron task: ${lockName}`);
        await actionFn();
      } catch (err) {
        console.error(`[Scheduler] Error dispatching ${lockName}:`, err);
      } finally {
        await lockService.release(`cron:${lockName}`, lockToken);
      }
    });

    this.tasks.push(task);
  }

  stop() {
    console.log('[Scheduler] Stopping cron tasks...');
    for (const task of this.tasks) {
      task.stop();
    }
  }
}

module.exports = new SchedulerService();
