const AIProvider = require('./ai.provider');

/**
 * Mistral adapter.
 * Uses OpenAI-compatible API at https://api.mistral.ai/v1
 */
class MistralProvider extends AIProvider {
  constructor(config) {
    super();
    this.apiKey = config.apiKey;
    this.model = config.model || 'mistral-large-latest';
    this.baseUrl = 'https://api.mistral.ai/v1';
  }

  async generateCompletion(messages, options = {}) {
    return {
      content: '[Mistral] Generated completion',
      usage: { promptTokens: 11, completionTokens: 19, totalTokens: 30 },
    };
  }

  async *streamCompletion(messages, options = {}) {
    yield '[Mistral] Streaming ';
    yield 'content ';
    yield 'chunk.';
  }
}

module.exports = MistralProvider;
