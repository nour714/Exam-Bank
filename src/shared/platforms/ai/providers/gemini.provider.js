const AIProvider = require('./ai.provider');

class GeminiProvider extends AIProvider {
  constructor(config) {
    super();
    this.apiKey = config.apiKey;
    // this.client = new GoogleGenerativeAI(this.apiKey);
  }

  async generateCompletion(messages, options) {
    // Dummy implementation replacing actual API call
    return {
      content: "[Gemini] Generated content based on prompt",
      usage: { promptTokens: 8, completionTokens: 15, totalTokens: 23 }
    };
  }

  async *streamCompletion(messages, options) {
    yield "[Gemini] Streaming ";
    yield "content ";
    yield "chunk.";
  }
}

module.exports = GeminiProvider;
