const featureFlagRepository = require('./feature-flag.repository');
const { logger } = require('../../shared/logger');

/**
 * In-memory cache for feature flags to avoid DB hits on every check.
 * Invalidated on every write operation.
 */
let flagCache = new Map();
let cacheLoaded = false;

class FeatureFlagService {
  /**
   * Check if a feature is enabled.
   * This is the hot-path method — called from within business logic.
   * @param {string} key
   * @param {string|null} tenantId
   * @returns {Promise<boolean>}
   */
  async isEnabled(key, tenantId = null) {
    const cacheKey = `${tenantId || 'global'}:${key}`;

    if (flagCache.has(cacheKey)) {
      return flagCache.get(cacheKey);
    }

    const flag = await featureFlagRepository.findByKey(key, tenantId);
    const enabled = flag ? flag.enabled : false;

    flagCache.set(cacheKey, enabled);
    return enabled;
  }

  /**
   * List all feature flags for a tenant (includes global flags).
   * @param {string|null} tenantId
   * @returns {Promise<Array>}
   */
  async listAll(tenantId = null) {
    return featureFlagRepository.findAll({ tenantId });
  }

  /**
   * Create or update a feature flag.
   * @param {Object} data - Validated flag data
   * @returns {Promise<Object>}
   */
  async upsert(data) {
    const flag = await featureFlagRepository.upsert(data);
    this._invalidateCache();
    logger.info({ key: data.key, enabled: data.enabled }, 'Feature flag upserted');
    return flag;
  }

  /**
   * Delete a feature flag.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async remove(id) {
    const result = await featureFlagRepository.deleteById(id);
    this._invalidateCache();
    logger.info({ id }, 'Feature flag deleted');
    return result;
  }

  /**
   * Clear the in-memory cache, forcing a re-read from DB on next access.
   */
  _invalidateCache() {
    flagCache = new Map();
    cacheLoaded = false;
  }
}

module.exports = new FeatureFlagService();
