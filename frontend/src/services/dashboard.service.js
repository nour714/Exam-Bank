import { store } from '../core/state-store.js';
import { eventBus } from '../core/event-bus.js';
import { measure, recordCacheHit, recordCacheMiss } from '../core/observability.js';
import { queryCache } from '../core/query-cache.js';
import { requestManager } from '../core/request-manager.js';

// ─── Provider Injection ────────────────────────────────────────
let provider = null;

export function setDashboardProvider(p) {
  provider = p;
}

// ─── Configuration ─────────────────────────────────────────────
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_KEYS = {
  summary: 'dashboard:summary',
  activity: 'dashboard:activity',
  performance: 'dashboard:performance'
};

// ─── Internal Helpers ──────────────────────────────────────────

async function staleWhileRevalidate(cacheKey, providerMethod, eventName, forceRefresh = false) {
  if (!provider) {
    throw new Error('[DashboardService] No provider set. Call setDashboardProvider() first.');
  }

  const cached = queryCache.get(cacheKey);

  // 1. Fresh cache
  if (!forceRefresh && cached && !cached.isStale) {
    recordCacheHit();
    return { data: cached.data, fromCache: true };
  }

  // 2. Stale cache
  if (!forceRefresh && cached && cached.isStale) {
    recordCacheHit();
    fetchFromProvider(cacheKey, providerMethod, eventName);
    return { data: cached.data, fromCache: true };
  }

  // 3. No cache or forced
  recordCacheMiss();
  const data = await fetchFromProvider(cacheKey, providerMethod, eventName);
  return { data, fromCache: false };
}

async function fetchFromProvider(cacheKey, providerMethod, eventName) {
  return requestManager.execute(cacheKey, async () => {
    return measure(`dashboard.${providerMethod}`, 'api', async () => {
      const data = await provider[providerMethod](cacheKey);
      queryCache.set(cacheKey, data, CACHE_TTL);
      eventBus.emit(eventName, data);
      return data;
    });
  });
}

// ─── Public API ────────────────────────────────────────────────

export const dashboardService = {
  async getSummary(forceRefresh = false) {
    return staleWhileRevalidate(
      CACHE_KEYS.summary,
      'getSummary',
      'dashboard.summary.updated',
      forceRefresh
    );
  },

  async getActivity(forceRefresh = false) {
    return staleWhileRevalidate(
      CACHE_KEYS.activity,
      'getActivity',
      'dashboard.activity.updated',
      forceRefresh
    );
  },

  async getPerformanceData(forceRefresh = false) {
    return staleWhileRevalidate(
      CACHE_KEYS.performance,
      'getPerformanceData',
      'dashboard.performance.updated',
      forceRefresh
    );
  },

  clearCache() {
    Object.values(CACHE_KEYS).forEach(key => queryCache.invalidate(key));
    Object.values(CACHE_KEYS).forEach(key => requestManager.cancel(key));
  }
};

eventBus.on('auth.logout', () => dashboardService.clearCache());
