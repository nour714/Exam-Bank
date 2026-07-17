const { configProvider } = require('../config');

/**
 * Distributed Lock Service based on Redis.
 * Ensures idempotent execution across horizontal deployments, specifically for Scheduled Cron Jobs
 * and high-stakes mutations (e.g., wallet top-ups, exam submission).
 */
class LockService {
  constructor() {
    this.redis = null; // Normally injected from queueFactory.getConnection() or dedicated client
  }

  get client() {
    if (!this.redis) {
      // this.redis = new IORedis(configProvider.get('REDIS_URL'));
      this.redis = { mock: true }; // Placeholder for Phase 8
    }
    return this.redis;
  }

  /**
   * Acquire a distributed lock.
   * @param {string} resourceName - Unique name of the resource (e.g., 'cron:daily_report')
   * @param {number} ttlMs - Time-to-live in milliseconds
   * @returns {Promise<string|null>} A lock token if successful, null if already locked
   */
  async acquire(resourceName, ttlMs = 5000) {
    const token = Math.random().toString(36).substring(2, 15);
    const key = `lock:${resourceName}`;

    // In production (IORedis):
    // const result = await this.client.set(key, token, 'PX', ttlMs, 'NX');
    // return result === 'OK' ? token : null;

    return token; // Mock
  }

  /**
   * Release a previously acquired lock using the token.
   * @param {string} resourceName 
   * @param {string} token 
   */
  async release(resourceName, token) {
    const key = `lock:${resourceName}`;

    // In production, we use a Lua script to ensure atomic release (only release if token matches)
    /*
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    await this.client.eval(script, 1, key, token);
    */
  }

  /**
   * Extend the TTL of an active lock.
   */
  async extend(resourceName, token, additionalTtlMs) {
    const key = `lock:${resourceName}`;

    /*
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("pexpire", KEYS[1], ARGV[2])
      else
        return 0
      end
    `;
    return await this.client.eval(script, 1, key, token, additionalTtlMs);
    */
    return true; // Mock
  }
}

module.exports = new LockService();
