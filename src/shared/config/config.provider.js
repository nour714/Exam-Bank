/**
 * Centralized Configuration Provider.
 *
 * This layer abstracts the source of configuration values away from the business logic.
 * Currently, it loads from environment variables, but it is designed to seamlessly integrate
 * with a Runtime Settings Module, AWS Secrets Manager, HashiCorp Vault, or JSON files
 * in the future without changing any consuming code.
 */
class ConfigProvider {
  constructor() {
    // In a more complex setup, we'd load environment variables into a structured internal state here
    // e.g., this.config = { ai: { defaultProvider: process.env.AI_DEFAULT_PROVIDER }, ... }
  }

  /**
   * Get a configuration value by key.
   * @param {string} key - The configuration key (e.g., 'OPENAI_API_KEY').
   * @param {*} [defaultValue] - The default value if the key is not found.
   * @returns {*} The configuration value.
   */
  get(key, defaultValue = null) {
    // Stage 1: Check runtime/in-memory overrides (if implemented)
    // Stage 2: Check environment variables
    if (process.env[key] !== undefined) {
      return process.env[key];
    }
    
    // Stage 3: Return default
    return defaultValue;
  }

  /**
   * Get an integer configuration value.
   * @param {string} key
   * @param {number} defaultValue
   * @returns {number}
   */
  getInt(key, defaultValue = 0) {
    const value = this.get(key);
    if (value === null || value === '') return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Get a boolean configuration value.
   * @param {string} key
   * @param {boolean} defaultValue
   * @returns {boolean}
   */
  getBoolean(key, defaultValue = false) {
    const value = this.get(key);
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return defaultValue;
  }

  /**
   * Check if a feature or provider is enabled based on its required config keys.
   * @param {string[]} requiredKeys
   * @returns {boolean}
   */
  hasConfig(requiredKeys) {
    return requiredKeys.every(key => this.get(key) !== null && this.get(key) !== '');
  }
}

// Export as a singleton
module.exports = new ConfigProvider();
