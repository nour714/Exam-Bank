const AIProvider = require('./ai.provider');

/**
 * DeepSeek adapter.
 * Uses OpenAI-compatible API at https://api.deepseek.com/v1
 */
class DeepSeekProvider extends AIProvider {
  constructor(config) {
    super();
    this.apiKey = config.apiKey;
    this.model = config.model || 'deepseek-chat';
    this.baseUrl = 'https://api.deepseek.com/v1';
  }

  async generateCompletion(messages, options = {}) {
    return {
      content: '[DeepSeek] Generated completion',
      usage: { promptTokens: 10, completionTokens: 18, totalTokens: 28 },
    };
  }

  async *streamCompletion(messages, options = {}) {
    yield '[DeepSeek] Streaming ';
    yield 'content ';
    yield 'chunk.';
  }
}

module.exports = DeepSeekProvider;
