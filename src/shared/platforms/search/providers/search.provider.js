class SearchProvider {
  /**
   * Index a document into the search engine.
   * @param {string} indexName
   * @param {string} id
   * @param {Object} document
   * @returns {Promise<void>}
   */
  async indexDocument(indexName, id, document) {
    throw new Error('Method not implemented.');
  }

  /**
   * Remove a document from the search engine.
   */
  async removeDocument(indexName, id) {
    throw new Error('Method not implemented.');
  }

  /**
   * Search documents.
   * @param {string} indexName 
   * @param {string} query 
   * @param {Object} options - filters, pagination, sort
   * @returns {Promise<Object>} { hits: [], total: number }
   */
  async search(indexName, query, options) {
    throw new Error('Method not implemented.');
  }
}

module.exports = SearchProvider;
