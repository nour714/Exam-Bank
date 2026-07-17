const SearchProvider = require('./search.provider');

/**
 * Meilisearch adapter for blazing-fast typo-tolerant search.
 * Requires `meilisearch` npm package when activated.
 */
class MeilisearchProvider extends SearchProvider {
  constructor(config) {
    super();
    this.host = config.host || 'http://localhost:7700';
    this.apiKey = config.apiKey;
    // this.client = new MeiliSearch({ host: this.host, apiKey: this.apiKey });
  }

  async indexDocument(indexName, id, document) {
    // const index = this.client.index(indexName);
    // await index.addDocuments([{ id, ...document }]);
  }

  async removeDocument(indexName, id) {
    // const index = this.client.index(indexName);
    // await index.deleteDocument(id);
  }

  async search(indexName, query, options = {}) {
    // const index = this.client.index(indexName);
    // const result = await index.search(query, {
    //   limit: options.limit || 20,
    //   offset: options.offset || 0,
    //   filter: options.filters,
    //   sort: options.sort,
    //   facets: options.facets,
    //   attributesToHighlight: options.highlight,
    // });
    return {
      hits: [],
      total: 0,
      facets: {},
      processingTimeMs: 0,
    };
  }
}

module.exports = MeilisearchProvider;
