const AIProvider = require('./ai.provider');

/**
 * OpenRouter adapter — unified gateway to 200+ models via a single API key.
 * Uses OpenAI-compatible endpoint at https://openrouter.ai/api/v1
 */
class OpenRouterProvider extends AIProvider {
  constructor(config) {
    super();
    this.apiKey = config.apiKey;
    this.model = config.model || 'openai/gpt-4o';
    this.baseUrl = 'https://openrouter.ai/api/v1';
  }

  async generateCompletion(messages, options = {}) {
    // Uses fetch to call OpenRouter's OpenAI-compatible chat/completions endpoint
    // const response = await fetch(`${this.baseUrl}/chat/completions`, {
    //   method: 'POST',
    //   headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ model: options.model || this.model, messages, max_tokens: options.maxTokens }),
    // });
    return {
      content: '[OpenRouter] Generated completion',
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
    };
  }

  async *streamCompletion(messages, options = {}) {
    yield '[OpenRouter] Streaming ';
    yield 'content ';
    yield 'chunk.';
  }
}

module.exports = OpenRouterProvider;
