const { getPrismaClient } = require('../../shared/database');

class TenantRepository {
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
   * Create a new tenant.
   */
  async create(data) {
    return this.prisma.tenant.create({ data });
  }

  /**
   * Find a tenant by ID.
   */
  async findById(id) {
    return this.prisma.tenant.findUnique({
      where: { id },
    });
  }

  /**
   * Find a tenant by domain.
   */
  async findByDomain(domain) {
    return this.prisma.tenant.findUnique({
      where: { domain },
    });
  }

  /**
   * Update tenant details.
   */
  async update(id, data) {
    return this.prisma.tenant.update({
      where: { id },
      data,
    });
  }

  /**
   * Suspend a tenant (deactivate).
   */
  async suspend(id) {
    return this.prisma.tenant.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Activate a tenant.
   */
  async activate(id) {
    return this.prisma.tenant.update({
      where: { id },
      data: { isActive: true },
    });
  }

  /**
   * Get all tenants with pagination. (Super Admin only usually)
   */
  async findAll(options = {}) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where = {};
    if (options.search) {
      where.name = { contains: options.search, mode: 'insensitive' };
    }

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return { tenants, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

module.exports = new TenantRepository();
