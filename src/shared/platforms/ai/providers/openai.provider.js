const AIProvider = require('./ai.provider');

class OpenAIProvider extends AIProvider {
  constructor(config) {
    super();
    this.apiKey = config.apiKey;
    // In a real app, instantiate the actual openai sdk client here
    // this.client = new OpenAI({ apiKey: this.apiKey });
  }

  async generateCompletion(messages, options) {
    // Dummy implementation replacing actual API call
    return {
      content: "[OpenAI] Generated content based on prompt",
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 }
    };
  }

  async *streamCompletion(messages, options) {
    yield "[OpenAI] Streaming ";
    yield "content ";
    yield "chunk.";
  }
}

module.exports = OpenAIProvider;
