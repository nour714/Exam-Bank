const userRepository = require('./user.repository');
const { NotFoundError, BadRequestError } = require('../../shared/errors');
const { eventBus } = require('../../shared/events');
const { AUDIT_ACTIONS } = require('../../shared/constants');

class UserService {
  /**
   * Get paginated users for a tenant.
   */
  async getTenantUsers(tenantId, options) {
    return userRepository.findByTenant(tenantId, options);
  }

  /**
   * Get a user by ID.
   */
  async getUser(id, tenantId) {
    const user = await userRepository.findById(id);
    if (!user || user.tenantId !== tenantId) {
      throw new NotFoundError('User not found');
    }
    return this._sanitize(user);
  }

  /**
   * Update a user's profile.
   */
  async updateUser(id, tenantId, data, currentUserId) {
    const user = await this.getUser(id, tenantId); // Ensures existence and tenant match
    
    const updated = await userRepository.update(id, data);
    
    // Optional audit log (via event or direct import if needed, assuming auth handles audit for now, 
    // or we can publish an event)
    eventBus.publish('user:updated', { userId: id, updatedBy: currentUserId, data });
    
    return this._sanitize(updated);
  }

  /**
   * Assign a role to a user.
   */
  async assignRole(id, tenantId, roleName, currentUserId) {
    await this.getUser(id, tenantId);
    await userRepository.assignRole(id, roleName);
    
    eventBus.publish('user:role_assigned', { userId: id, roleName, assignedBy: currentUserId });
  }

  /**
   * Remove a role from a user.
   */
  async removeRole(id, tenantId, roleName, currentUserId) {
    await this.getUser(id, tenantId);
    await userRepository.removeRole(id, roleName);
    
    eventBus.publish('user:role_revoked', { userId: id, roleName, revokedBy: currentUserId });
  }

  /**
   * Deactivate a user.
   */
  async deactivateUser(id, tenantId, currentUserId) {
    await this.getUser(id, tenantId);
    await userRepository.deactivate(id);
    
    // Force logout (Auth module should listen to this)
    eventBus.publish('user:deactivated', { userId: id, deactivatedBy: currentUserId });
  }

  /**
   * Reactivate a user.
   */
  async activateUser(id, tenantId, currentUserId) {
    await this.getUser(id, tenantId);
    await userRepository.activate(id);
    eventBus.publish('user:activated', { userId: id, activatedBy: currentUserId });
  }

  _sanitize(user) {
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}

module.exports = new UserService();
