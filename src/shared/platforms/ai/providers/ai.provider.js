class AIProvider {
  /**
   * Initialize the provider with API keys and config.
   */
  constructor(config) {
    if (new.target === AIProvider) {
      throw new TypeError("Cannot construct Abstract instances directly");
    }
  }

  /**
   * Generate a completion for a prompt.
   * @param {Array} messages - Chat messages [{ role: 'system', content: '...' }, ...]
   * @param {Object} options - temperature, maxTokens, etc.
   * @returns {Promise<Object>} { content, usage: { promptTokens, completionTokens, totalTokens } }
   */
  async generateCompletion(messages, options) {
    throw new Error('Method not implemented.');
  }

  /**
   * Generate a streaming completion.
   * @param {Array} messages
   * @param {Object} options
   * @returns {AsyncGenerator} Yields chunks of text.
   */
  async *streamCompletion(messages, options) {
    throw new Error('Method not implemented.');
  }
}

module.exports = AIProvider;
