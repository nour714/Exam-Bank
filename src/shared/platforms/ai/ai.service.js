const OpenAIProvider = require('./providers/openai.provider');
const GeminiProvider = require('./providers/gemini.provider');
const AnthropicProvider = require('./providers/anthropic.provider');
const OpenRouterProvider = require('./providers/openrouter.provider');
const OllamaProvider = require('./providers/ollama.provider');
const DeepSeekProvider = require('./providers/deepseek.provider');
const QwenProvider = require('./providers/qwen.provider');
const MistralProvider = require('./providers/mistral.provider');
const { eventBus } = require('../../events');

/**
 * AI Service Gateway.
 *
 * Central façade for all LLM interactions. Business modules call
 * `aiService.generateCompletion(messages, { provider: 'gemini' })` — they never
 * import or configure individual provider SDKs.
 *
 * Features:
 * - Provider registry with config-driven activation
 * - Automatic telemetry via EventBus (usage, cost, failures)
 * - Streaming support via AsyncGenerators
 * - Retry & fallback preparation (see `generateWithFallback`)
 * - Provider health check via `healthCheck()`
 */
class AIService {
  constructor() {
    /** @type {Map<string, import('./providers/ai.provider')>} */
    this.providers = new Map();
    this.defaultProvider = null;
    /** @type {string[]} Ordered list of provider names for fallback chain */
    this.fallbackChain = [];
  }

  /**
   * Register a provider adapter with the platform.
   * @param {string} name - Unique provider key (e.g., 'openai', 'gemini')
   * @param {import('./providers/ai.provider')} providerInstance
   * @param {boolean} [isDefault=false]
   */
  registerProvider(name, providerInstance, isDefault = false) {
    this.providers.set(name, providerInstance);
    this.fallbackChain.push(name);
    if (isDefault || !this.defaultProvider) {
      this.defaultProvider = name;
    }
  }

  /**
   * Get an active provider by name.
   * @param {string} [name]
   * @returns {import('./providers/ai.provider')}
   */
  getProvider(name) {
    const providerName = name || this.defaultProvider;
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`AI Provider '${providerName}' is not registered. Available: [${[...this.providers.keys()].join(', ')}]`);
    }
    return provider;
  }

  /**
   * Generate completion using a specific or default provider.
   * @param {Array<{role: string, content: string}>} messages
   * @param {Object} [options] - { provider, temperature, maxTokens, model }
   * @returns {Promise<{content: string, usage: Object}>}
   */
  async generateCompletion(messages, options = {}) {
    const providerName = options.provider || this.defaultProvider;
    const provider = this.getProvider(providerName);

    try {
      const result = await provider.generateCompletion(messages, options);

      eventBus.publish('ai:completion_generated', {
        provider: providerName,
        usage: result.usage,
        model: options.model,
      });

      return result;
    } catch (error) {
      eventBus.publish('ai:completion_failed', {
        provider: providerName,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Generate completion with automatic fallback through the provider chain.
   * If the primary provider fails, tries the next registered provider.
   * @param {Array} messages
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async generateWithFallback(messages, options = {}) {
    const startProvider = options.provider || this.defaultProvider;
    const startIndex = this.fallbackChain.indexOf(startProvider);
    const chain = startIndex >= 0
      ? [...this.fallbackChain.slice(startIndex), ...this.fallbackChain.slice(0, startIndex)]
      : this.fallbackChain;

    let lastError = null;

    for (const providerName of chain) {
      try {
        return await this.generateCompletion(messages, { ...options, provider: providerName });
      } catch (error) {
        lastError = error;
        eventBus.publish('ai:fallback_triggered', {
          failedProvider: providerName,
          error: error.message,
        });
      }
    }

    throw lastError || new Error('All AI providers failed.');
  }

  /**
   * Stream completion using a specific or default provider.
   * @param {Array} messages
   * @param {Object} [options]
   * @returns {AsyncGenerator<string>}
   */
  async *streamCompletion(messages, options = {}) {
    const provider = this.getProvider(options.provider);
    yield* provider.streamCompletion(messages, options);
  }

  /**
   * Health check — verify all registered providers are reachable.
   * @returns {Promise<Object>} Map of provider name → { healthy: boolean, latencyMs: number }
   */
  async healthCheck() {
    const results = {};
    for (const [name, provider] of this.providers) {
      const start = Date.now();
      try {
        await provider.generateCompletion(
          [{ role: 'user', content: 'ping' }],
          { maxTokens: 1 }
        );
        results[name] = { healthy: true, latencyMs: Date.now() - start };
      } catch {
        results[name] = { healthy: false, latencyMs: Date.now() - start };
      }
    }
    return results;
  }

  /**
   * List all registered providers and the current default.
   * @returns {Object}
   */
  getStatus() {
    return {
      default: this.defaultProvider,
      registered: [...this.providers.keys()],
      fallbackChain: this.fallbackChain,
    };
  }
}

const { configProvider } = require('../../config');

// ─── Singleton + Config-driven provider registration ───────
const aiService = new AIService();

const defaultAIProvider = configProvider.get('AI_DEFAULT_PROVIDER', 'openai');

// Register providers based on available API keys
const providerConfigs = [
  { name: 'openai',     key: 'OPENAI_API_KEY',     Provider: OpenAIProvider },
  { name: 'gemini',     key: 'GEMINI_API_KEY',      Provider: GeminiProvider },
  { name: 'anthropic',  key: 'ANTHROPIC_API_KEY',   Provider: AnthropicProvider },
  { name: 'openrouter', key: 'OPENROUTER_API_KEY',  Provider: OpenRouterProvider },
  { name: 'deepseek',   key: 'DEEPSEEK_API_KEY',    Provider: DeepSeekProvider },
  { name: 'qwen',       key: 'QWEN_API_KEY',        Provider: QwenProvider },
  { name: 'mistral',    key: 'MISTRAL_API_KEY',     Provider: MistralProvider },
];

for (const { name, key, Provider } of providerConfigs) {
  const apiKey = configProvider.get(key);
  if (apiKey) {
    aiService.registerProvider(
      name,
      new Provider({ apiKey }),
      name === defaultAIProvider
    );
  }
}

// Ollama — no API key needed, just a host URL
const ollamaHost = configProvider.get('OLLAMA_HOST');
if (ollamaHost) {
  aiService.registerProvider(
    'ollama',
    new OllamaProvider({ baseUrl: ollamaHost }),
    'ollama' === defaultAIProvider
  );
}

module.exports = aiService;
