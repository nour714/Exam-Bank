const { getPrismaClient } = require('../../shared/database');

/**
 * Repository for User data operations.
 * Provides all database interactions for user records and role assignments.
 */
class UserRepository {
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
   * Create a new user.
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async create(data) {
    if (data.tenantId) {
      await this.prisma.tenant.upsert({
        where: { id: data.tenantId },
        create: { id: data.tenantId, name: 'Default Tenant' },
        update: {},
      });
    }
    return this.prisma.user.create({
      data,
      include: { roles: { include: { role: true } } },
    });
  }

  /**
   * Find a user by ID, including roles.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
        tenant: true,
      },
    });
  }

  /**
   * Find a user by email, including roles (for authentication).
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: { include: { role: true } },
      },
    });
  }

  /**
   * Update a user record.
   * @param {string} id
   * @param {Object} data - Fields to update.
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    return this.prisma.user.update({
      where: { id },
      data,
      include: { roles: { include: { role: true } } },
    });
  }

  /**
   * Find all users for a tenant with pagination.
   * @param {string} tenantId
   * @param {Object} options - { page, limit, search }
   * @returns {Promise<{ users: Array, total: number }>}
   */
  async findByTenant(tenantId, options = {}) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where = { tenantId };

    if (options.search) {
      where.OR = [
        { firstName: { contains: options.search, mode: 'insensitive' } },
        { lastName: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { roles: { include: { role: true } } },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Assign a role to a user by role name.
   * Creates the role if it does not exist (for system seeding).
   * @param {string} userId
   * @param {string} roleName
   * @returns {Promise<Object>}
   */
  async assignRole(userId, roleName) {
    // Find or create the role
    let role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      role = await this.prisma.role.create({
        data: { name: roleName, isSystem: true },
      });
    }

    return this.prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId: role.id } },
      create: { userId, roleId: role.id },
      update: {},
    });
  }

  /**
   * Remove a role from a user by role name.
   * @param {string} userId
   * @param {string} roleName
   * @returns {Promise<void>}
   */
  async removeRole(userId, roleName) {
    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) return;

    await this.prisma.userRole.deleteMany({
      where: { userId, roleId: role.id },
    });
  }

  /**
   * Soft-deactivate a user (does not delete the record).
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async deactivate(id) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Reactivate a user.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async activate(id) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });
  }
}

module.exports = new UserRepository();
