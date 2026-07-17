const AIProvider = require('./ai.provider');

/**
 * Anthropic Claude adapter.
 * Requires `@anthropic-ai/sdk` npm package when activated.
 */
class AnthropicProvider extends AIProvider {
  constructor(config) {
    super();
    this.apiKey = config.apiKey;
    this.model = config.model || 'claude-sonnet-4-20250514';
    // this.client = new Anthropic({ apiKey: this.apiKey });
  }

  async generateCompletion(messages, options = {}) {
    // Convert from OpenAI-style messages to Anthropic format
    // const systemMsg = messages.find(m => m.role === 'system')?.content || '';
    // const userMsgs = messages.filter(m => m.role !== 'system');
    // const response = await this.client.messages.create({
    //   model: this.model,
    //   max_tokens: options.maxTokens || 4096,
    //   system: systemMsg,
    //   messages: userMsgs,
    // });
    return {
      content: '[Anthropic] Generated completion',
      usage: { promptTokens: 12, completionTokens: 25, totalTokens: 37 },
    };
  }

  async *streamCompletion(messages, options = {}) {
    yield '[Anthropic] Streaming ';
    yield 'content ';
    yield 'chunk.';
  }
}

module.exports = AnthropicProvider;
