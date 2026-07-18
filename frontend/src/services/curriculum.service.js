import { eventBus } from '../core/event-bus.js';
import { measure, recordCacheHit, recordCacheMiss } from '../core/observability.js';
import { queryCache } from '../core/query-cache.js';
import { requestManager } from '../core/request-manager.js';

let provider = null;

export function setCurriculumProvider(p) {
  provider = p;
}

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes for curriculum data, it changes rarely

async function staleWhileRevalidate(cacheKey, providerMethod, eventName, forceRefresh = false, ...providerArgs) {
  if (!provider) throw new Error('[CurriculumService] No provider set.');

  const cached = queryCache.get(cacheKey);

  // 1. Fresh cache
  if (!forceRefresh && cached && !cached.isStale) {
    recordCacheHit();
    return { data: cached.data, fromCache: true };
  }

  // 2. Stale cache
  if (!forceRefresh && cached && cached.isStale) {
    recordCacheHit();
    fetchFromProvider(cacheKey, providerMethod, eventName, ...providerArgs);
    return { data: cached.data, fromCache: true };
  }

  // 3. No cache or forced
  recordCacheMiss();
  const data = await fetchFromProvider(cacheKey, providerMethod, eventName, ...providerArgs);
  return { data, fromCache: false };
}

async function fetchFromProvider(cacheKey, providerMethod, eventName, ...providerArgs) {
  return requestManager.execute(cacheKey, async () => {
    return measure(`curriculum.${providerMethod}`, 'api', async () => {
      const data = await provider[providerMethod](cacheKey, ...providerArgs);
      queryCache.set(cacheKey, data, CACHE_TTL);
      eventBus.emit(eventName, data);
      return data;
    });
  });
}

export const curriculumService = {
  async getSubjects(forceRefresh = false) {
    return staleWhileRevalidate(
      'curriculum:subjects',
      'getSubjects',
      'curriculum.subjects.updated',
      forceRefresh
    );
  },

  async getUnits(subjectId, forceRefresh = false) {
    return staleWhileRevalidate(
      `curriculum:units:${subjectId}`,
      'getUnits',
      'curriculum.units.updated',
      forceRefresh,
      subjectId
    );
  },

  async getLessons(unitId, forceRefresh = false) {
    return staleWhileRevalidate(
      `curriculum:lessons:${unitId}`,
      'getLessons',
      'curriculum.lessons.updated',
      forceRefresh,
      unitId
    );
  },

  clearCache() {
    queryCache.invalidateByPrefix('curriculum:');
  }
};

eventBus.on('auth.logout', () => curriculumService.clearCache());
