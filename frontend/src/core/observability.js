/**
 * Frontend Observability Utility.
 * Tracks widget render times, API response times, and cache hit ratios.
 * Metrics are stored in-memory and can be retrieved for monitoring dashboards.
 */

const metrics = {
  renders: [],   // { widget, duration, timestamp }
  api: [],       // { endpoint, duration, timestamp, cached }
  cacheHits: 0,
  cacheMisses: 0
};

const MAX_ENTRIES = 200; // Rolling window

/**
 * Measure the execution time of an async function.
 * @param {string} label - Human-readable label for the metric
 * @param {string} category - 'render' | 'api'
 * @param {Function} fn - Async function to measure
 * @returns {Promise<any>} The result of fn()
 */
export async function measure(label, category, fn) {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = Math.round((performance.now() - start) * 100) / 100;

    if (category === 'render') {
      metrics.renders.push({ widget: label, duration, timestamp: Date.now() });
      if (metrics.renders.length > MAX_ENTRIES) metrics.renders.shift();
    } else if (category === 'api') {
      metrics.api.push({ endpoint: label, duration, timestamp: Date.now(), cached: false });
      if (metrics.api.length > MAX_ENTRIES) metrics.api.shift();
    }

    return result;
  } catch (err) {
    const duration = Math.round((performance.now() - start) * 100) / 100;
    if (category === 'api') {
      metrics.api.push({ endpoint: label, duration, timestamp: Date.now(), cached: false, error: true });
      if (metrics.api.length > MAX_ENTRIES) metrics.api.shift();
    }
    throw err;
  }
}

/**
 * Record a cache hit.
 */
export function recordCacheHit() {
  metrics.cacheHits++;
}

/**
 * Record a cache miss.
 */
export function recordCacheMiss() {
  metrics.cacheMisses++;
}

/**
 * Get the current cache hit ratio (0..1).
 */
export function getCacheHitRatio() {
  const total = metrics.cacheHits + metrics.cacheMisses;
  if (total === 0) return 0;
  return Math.round((metrics.cacheHits / total) * 1000) / 1000;
}

/**
 * Get a snapshot of all collected metrics.
 */
export function getMetricsSnapshot() {
  return {
    renders: [...metrics.renders],
    api: [...metrics.api],
    cacheHitRatio: getCacheHitRatio(),
    cacheHits: metrics.cacheHits,
    cacheMisses: metrics.cacheMisses
  };
}

/**
 * Reset all metrics (useful for testing).
 */
export function resetMetrics() {
  metrics.renders.length = 0;
  metrics.api.length = 0;
  metrics.cacheHits = 0;
  metrics.cacheMisses = 0;
}
