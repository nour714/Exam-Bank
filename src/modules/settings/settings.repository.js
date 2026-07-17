const { getPrismaClient } = require('../../shared/database');

class SettingsRepository {
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
   * Get a single setting by category + key. Tenant-scoped settings take priority.
   * @param {string} category
   * @param {string} key
   * @param {string|null} tenantId
   * @returns {Promise<Object|null>}
   */
  async findByCategoryAndKey(category, key, tenantId = null) {
    return this.prisma.appSetting.findFirst({
      where: {
        category,
        key,
        OR: [
          { tenantId },
          { tenantId: null },
        ],
      },
      orderBy: { tenantId: 'desc' },
    });
  }

  /**
   * Get all settings in a category.
   * @param {string} category
   * @param {string|null} tenantId
   * @returns {Promise<Array>}
   */
  async findByCategory(category, tenantId = null) {
    return this.prisma.appSetting.findMany({
      where: {
        category,
        OR: [
          { tenantId },
          { tenantId: null },
        ],
      },
      orderBy: { key: 'asc' },
    });
  }

  /**
   * List all settings, optionally filtered by tenant.
   * @param {string|null} tenantId
   * @returns {Promise<Array>}
   */
  async findAll(tenantId = null) {
    const where = {};
    if (tenantId !== undefined) {
      where.OR = [
        { tenantId },
        { tenantId: null },
      ];
    }
    return this.prisma.appSetting.findMany({ where, orderBy: [{ category: 'asc' }, { key: 'asc' }] });
  }

  /**
   * Upsert a setting.
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async upsert(data) {
    return this.prisma.appSetting.upsert({
      where: {
        tenantId_category_key: {
          tenantId: data.tenantId ?? null,
          category: data.category,
          key: data.key,
        },
      },
      update: {
        value: data.value,
      },
      create: {
        tenantId: data.tenantId ?? null,
        category: data.category,
        key: data.key,
        value: data.value,
      },
    });
  }

  /**
   * Delete a setting by ID.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async deleteById(id) {
    return this.prisma.appSetting.delete({ where: { id } });
  }
}

module.exports = new SettingsRepository();
