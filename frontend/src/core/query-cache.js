/**
 * Global Query Cache
 * Provides generic caching for all frontend services.
 */
export class QueryCache {
  constructor() {
    this._cache = new Map();
  }

  /**
   * Set a value in the cache.
   * @param {string} key 
   * @param {any} data 
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, data, ttl = 5 * 60 * 1000) {
    this._cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Get a value from the cache. Returns null if expired or missing.
   * @param {string} key 
   * @returns {{ data: any, isStale: boolean } | null}
   */
  get(key) {
    const entry = this._cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    const isStale = age > entry.ttl;

    return {
      data: entry.data,
      isStale
    };
  }

  /**
   * Remove a specific key from the cache.
   * @param {string} key 
   */
  invalidate(key) {
    this._cache.delete(key);
  }

  /**
   * Remove all keys starting with a specific prefix.
   * @param {string} prefix 
   */
  invalidateByPrefix(prefix) {
    for (const key of this._cache.keys()) {
      if (key.startsWith(prefix)) {
        this._cache.delete(key);
      }
    }
  }

  /**
   * Clear the entire cache.
   */
  clear() {
    this._cache.clear();
  }
}

export const queryCache = new QueryCache();
