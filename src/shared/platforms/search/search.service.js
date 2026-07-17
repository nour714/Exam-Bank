const PostgresSearchProvider = require('./providers/postgres.provider');
const MeilisearchProvider = require('./providers/meilisearch.provider');
const ElasticsearchProvider = require('./providers/elasticsearch.provider');
const { eventBus } = require('../../events');

/**
 * Unified Search Service gateway.
 * Business modules call search.indexDocument() or search.search() — they never
 * know or care whether the underlying engine is PostgreSQL, Meilisearch, or Elasticsearch.
 */
class SearchService {
  constructor() {
    this.providers = new Map();
    this.defaultProvider = null;
  }

  registerProvider(name, providerInstance, isDefault = false) {
    this.providers.set(name, providerInstance);
    if (isDefault || !this.defaultProvider) {
      this.defaultProvider = name;
    }
  }

  getProvider(name) {
    const providerName = name || this.defaultProvider;
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Search Provider '${providerName}' is not registered.`);
    }
    return provider;
  }

  async indexDocument(indexName, id, document, options = {}) {
    const provider = this.getProvider(options.provider);
    await provider.indexDocument(indexName, id, document);
    eventBus.publish('search:document_indexed', { indexName, id });
  }

  async removeDocument(indexName, id, options = {}) {
    const provider = this.getProvider(options.provider);
    await provider.removeDocument(indexName, id);
    eventBus.publish('search:document_removed', { indexName, id });
  }

  async search(indexName, query, options = {}) {
    const provider = this.getProvider(options.provider);
    return provider.search(indexName, query, options);
  }
}

const { configProvider } = require('../../config');

// ─── Config-driven instantiation ───────────────────────────
const searchService = new SearchService();

const searchProvider = configProvider.get('SEARCH_PROVIDER', 'postgres');

switch (searchProvider) {
  case 'meilisearch':
    searchService.registerProvider('meilisearch', new MeilisearchProvider({
      host: configProvider.get('MEILISEARCH_HOST'),
      apiKey: configProvider.get('MEILISEARCH_KEY'),
    }), true);
    break;
  case 'elasticsearch':
    searchService.registerProvider('elasticsearch', new ElasticsearchProvider({
      node: configProvider.get('ELASTICSEARCH_NODE'),
    }), true);
    break;
  default:
    searchService.registerProvider('postgres', new PostgresSearchProvider(), true);
    break;
}

module.exports = searchService;
