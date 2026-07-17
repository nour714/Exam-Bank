const AIProvider = require('./ai.provider');

/**
 * Qwen adapter (Alibaba Cloud DashScope).
 * Uses OpenAI-compatible API at https://dashscope.aliyuncs.com/compatible-mode/v1
 */
class QwenProvider extends AIProvider {
  constructor(config) {
    super();
    this.apiKey = config.apiKey;
    this.model = config.model || 'qwen-turbo';
    this.baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  }

  async generateCompletion(messages, options = {}) {
    return {
      content: '[Qwen] Generated completion',
      usage: { promptTokens: 9, completionTokens: 16, totalTokens: 25 },
    };
  }

  async *streamCompletion(messages, options = {}) {
    yield '[Qwen] Streaming ';
    yield 'content ';
    yield 'chunk.';
  }
}

module.exports = QwenProvider;
