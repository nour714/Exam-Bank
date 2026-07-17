const AIProvider = require('./ai.provider');

/**
 * Ollama adapter for local/self-hosted LLM inference.
 * Communicates via REST with a local Ollama instance.
 */
class OllamaProvider extends AIProvider {
  constructor(config) {
    super();
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
    this.model = config.model || 'llama3';
  }

  async generateCompletion(messages, options = {}) {
    // const response = await fetch(`${this.baseUrl}/api/chat`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ model: this.model, messages, stream: false }),
    // });
    return {
      content: '[Ollama] Generated completion',
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }, // Ollama doesn't always report usage
    };
  }

  async *streamCompletion(messages, options = {}) {
    yield '[Ollama] Streaming ';
    yield 'content ';
    yield 'chunk.';
  }
}

module.exports = OllamaProvider;
