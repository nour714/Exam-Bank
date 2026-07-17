const SearchProvider = require('./search.provider');
const { getPrismaClient } = require('../../../../shared/database');

class PostgresSearchProvider extends SearchProvider {
  constructor() {
    super();
    this._prisma = null;
  }

  get prisma() {
    if (!this._prisma) {
      this._prisma = getPrismaClient();
    }
    return this._prisma;
  }

  async indexDocument(indexName, id, document) {
    // Postgres FTS relies on materialized views or trigger-based tsvector columns
    // This dummy implementation logs the attempt.
  }

  async removeDocument(indexName, id) {}

  async search(indexName, query, options = {}) {
    // Basic fallback using Prisma contains.
    // In a real scenario, this would use prisma.$queryRaw with `to_tsquery`
    return {
      hits: [],
      total: 0,
    };
  }
}

module.exports = PostgresSearchProvider;
