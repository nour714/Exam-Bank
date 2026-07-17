const settingsRepository = require('./settings.repository');
const { logger } = require('../../shared/logger');

/**
 * In-memory settings cache.
 * Structure: Map<"tenantId:category:key", value>
 */
let settingsCache = new Map();

class SettingsService {
  /**
   * Get a single setting value. Returns the raw JSON value.
   * Uses in-memory cache with DB fallback.
   * @param {string} category
   * @param {string} key
   * @param {*} defaultValue - Returned if setting is not found
   * @param {string|null} tenantId
   * @returns {Promise<*>}
   */
  async get(category, key, defaultValue = null, tenantId = null) {
    const cacheKey = `${tenantId || 'global'}:${category}:${key}`;

    if (settingsCache.has(cacheKey)) {
      return settingsCache.get(cacheKey);
    }

    const setting = await settingsRepository.findByCategoryAndKey(category, key, tenantId);
    const value = setting ? setting.value : defaultValue;

    settingsCache.set(cacheKey, value);
    return value;
  }

  /**
   * Get all settings within a category.
   * @param {string} category
   * @param {string|null} tenantId
   * @returns {Promise<Array>}
   */
  async getByCategory(category, tenantId = null) {
    return settingsRepository.findByCategory(category, tenantId);
  }

  /**
   * List all settings.
   * @param {string|null} tenantId
   * @returns {Promise<Array>}
   */
  async listAll(tenantId = null) {
    return settingsRepository.findAll(tenantId);
  }

  /**
   * Set a setting value.
   * @param {Object} data - Validated setting data
   * @returns {Promise<Object>}
   */
  async set(data) {
    const setting = await settingsRepository.upsert(data);
    this._invalidateCache();
    logger.info({ category: data.category, key: data.key }, 'Setting updated');
    return setting;
  }

  /**
   * Delete a setting.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async remove(id) {
    const result = await settingsRepository.deleteById(id);
    this._invalidateCache();
    logger.info({ id }, 'Setting deleted');
    return result;
  }

  /**
   * Bulk set multiple settings at once.
   * @param {Array<Object>} settingsArray - Array of validated setting objects
   * @returns {Promise<Array>}
   */
  async bulkSet(settingsArray) {
    const results = [];
    for (const data of settingsArray) {
      const result = await settingsRepository.upsert(data);
      results.push(result);
    }
    this._invalidateCache();
    logger.info({ count: settingsArray.length }, 'Bulk settings updated');
    return results;
  }

  /**
   * Clear the in-memory cache.
   */
  _invalidateCache() {
    settingsCache = new Map();
  }
}

module.exports = new SettingsService();
