const SearchProvider = require('./search.provider');

/**
 * Elasticsearch adapter for enterprise-scale search with complex aggregations.
 * Requires `@elastic/elasticsearch` npm package when activated.
 */
class ElasticsearchProvider extends SearchProvider {
  constructor(config) {
    super();
    this.node = config.node || 'http://localhost:9200';
    // this.client = new Client({ node: this.node, auth: config.auth });
  }

  async indexDocument(indexName, id, document) {
    // await this.client.index({ index: indexName, id, document });
  }

  async removeDocument(indexName, id) {
    // await this.client.delete({ index: indexName, id });
  }

  async search(indexName, query, options = {}) {
    // const result = await this.client.search({
    //   index: indexName,
    //   query: { multi_match: { query, fields: options.fields || ['*'] } },
    //   from: options.offset || 0,
    //   size: options.limit || 20,
    //   sort: options.sort,
    //   highlight: options.highlight ? { fields: { '*': {} } } : undefined,
    //   aggs: options.facets,
    // });
    return {
      hits: [],
      total: 0,
      aggregations: {},
    };
  }
}

module.exports = ElasticsearchProvider;
