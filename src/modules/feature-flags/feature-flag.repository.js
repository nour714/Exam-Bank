const { getPrismaClient } = require('../../shared/database');

class FeatureFlagRepository {
  constructor() {
    this._prisma = null;
  }

  get prisma() {
    if (!this._prisma) {
      this._prisma = getPrismaClient();
    }
    return this._prisma;
  }

  /**
   * Find a single flag by its key. Tenant-scoped flags take priority over global ones.
   * @param {string} key
   * @param {string|null} tenantId
   * @returns {Promise<Object|null>}
   */
  async findByKey(key, tenantId = null) {
    // First try tenant-specific, then fall back to global (tenantId = null)
    const flag = await this.prisma.featureFlag.findFirst({
      where: {
        key,
        OR: [
          { tenantId },
          { tenantId: null },
        ],
      },
      orderBy: {
        tenantId: 'desc', // Tenant-specific first (non-null sorts after null in desc)
      },
    });
    return flag;
  }

  /**
   * List all feature flags, optionally filtered by tenant.
   * @param {Object} filters
   * @returns {Promise<Array>}
   */
  async findAll(filters = {}) {
    const where = {};
    if (filters.tenantId !== undefined) {
      where.OR = [
        { tenantId: filters.tenantId },
        { tenantId: null },
      ];
    }
    return this.prisma.featureFlag.findMany({ where, orderBy: { key: 'asc' } });
  }

  /**
   * Upsert a feature flag.
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async upsert(data) {
    return this.prisma.featureFlag.upsert({
      where: {
        tenantId_key: {
          tenantId: data.tenantId ?? null,
          key: data.key,
        },
      },
      update: {
        enabled: data.enabled,
        description: data.description,
        metadata: data.metadata,
      },
      create: {
        tenantId: data.tenantId ?? null,
        key: data.key,
        enabled: data.enabled ?? false,
        description: data.description,
        metadata: data.metadata,
      },
    });
  }

  /**
   * Delete a feature flag by ID.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async deleteById(id) {
    return this.prisma.featureFlag.delete({ where: { id } });
  }
}

module.exports = new FeatureFlagRepository();
