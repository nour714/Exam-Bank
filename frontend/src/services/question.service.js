import { eventBus } from '../core/event-bus.js';
import { measure } from '../core/observability.js';
import { queryCache } from '../core/query-cache.js';
import { requestManager } from '../core/request-manager.js';
// queryCache is unused here because search results shouldn't be strictly cached globally like static subjects,
// or if they are, the cacheKey needs to be a hash of the criteria. 
// We will let requestManager deduplicate simultaneous identical searches.

let provider = null;

export function setQuestionProvider(p) {
  provider = p;
}

export const questionService = {
  /**
   * Search questions using generic criteria.
   * @param {Object} criteria - built via CriteriaBuilder
   * @returns {Promise<{ data: Array, nextCursor: string|null, hasMore: boolean, totalCount?: number }>}
   */
  async search(criteria) {
    if (!provider) throw new Error('[QuestionService] No provider set.');
    
    // Hash the criteria roughly for a cache key
    const criteriaStr = JSON.stringify(criteria);
    const hash = Array.from(criteriaStr).reduce((s, c) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0);
    const requestKey = `question:search:${hash}`;

    const cached = queryCache.get(requestKey);
    if (cached && !cached.isStale) {
      return cached.data;
    }
    
    return requestManager.execute(requestKey, async () => {
      return measure('question.search', 'api', async () => {
        const data = await provider.search(criteria);
        queryCache.set(requestKey, data, 5 * 60 * 1000);
        return data;
      });
    });
  },
  
  async getById(id) {
    if (!provider) throw new Error('[QuestionService] No provider set.');
    
    const requestKey = `question:get:${id}`;
    
    const cached = queryCache.get(requestKey);
    if (cached && !cached.isStale) {
      return cached.data;
    }
    
    return requestManager.execute(requestKey, async () => {
      return measure('question.getById', 'api', async () => {
        const data = await provider.getById(id);
        queryCache.set(requestKey, data, 5 * 60 * 1000);
        return data;
      });
    });
  },

  async create(payload) {
    if (!provider) throw new Error('[QuestionService] No provider set.');
    const data = await provider.create(payload);
    queryCache.invalidateByPrefix('question:search');
    return data;
  },

  async update(id, payload) {
    if (!provider) throw new Error('[QuestionService] No provider set.');
    const data = await provider.update(id, payload);
    queryCache.invalidateByPrefix('question:search');
    queryCache.invalidate(`question:get:${id}`);
    return data;
  },

  async delete(id) {
    if (!provider) throw new Error('[QuestionService] No provider set.');
    const data = await provider.delete(id);
    queryCache.invalidateByPrefix('question:search');
    queryCache.invalidate(`question:get:${id}`);
    return data;
  },

  async restore(id) {
    if (!provider) throw new Error('[QuestionService] No provider set.');
    const data = await provider.restore(id);
    queryCache.invalidateByPrefix('question:search');
    queryCache.invalidate(`question:get:${id}`);
    return data;
  },

  async permanentDelete(id) {
    if (!provider) throw new Error('[QuestionService] No provider set.');
    const data = await provider.permanentDelete(id);
    queryCache.invalidateByPrefix('question:search');
    queryCache.invalidate(`question:get:${id}`);
    return data;
  }
};
