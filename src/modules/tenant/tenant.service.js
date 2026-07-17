const tenantRepository = require('./tenant.repository');
const { BadRequestError, NotFoundError } = require('../../shared/errors');
const { eventBus } = require('../../shared/events');

class TenantService {
  /**
   * Create a new tenant.
   */
  async createTenant(data) {
    if (data.domain) {
      const existing = await tenantRepository.findByDomain(data.domain);
      if (existing) {
        throw new BadRequestError('Domain is already in use by another tenant');
      }
    }

    const tenant = await tenantRepository.create(data);
    
    eventBus.publish('tenant:created', { tenantId: tenant.id });
    
    return tenant;
  }

  /**
   * Get tenant by ID.
   */
  async getTenant(id) {
    const tenant = await tenantRepository.findById(id);
    if (!tenant) {
      throw new NotFoundError('Tenant not found');
    }
    return tenant;
  }

  /**
   * Update tenant details.
   */
  async updateTenant(id, data, currentUserId) {
    await this.getTenant(id); // Check existence

    if (data.domain) {
      const existing = await tenantRepository.findByDomain(data.domain);
      if (existing && existing.id !== id) {
        throw new BadRequestError('Domain is already in use by another tenant');
      }
    }

    const updated = await tenantRepository.update(id, data);
    
    eventBus.publish('tenant:updated', { tenantId: id, updatedBy: currentUserId });
    
    return updated;
  }

  /**
   * Suspend a tenant and cascade logout to all its users.
   */
  async suspendTenant(id, currentUserId) {
    await this.getTenant(id);
    await tenantRepository.suspend(id);
    
    eventBus.publish('tenant:suspended', { tenantId: id, suspendedBy: currentUserId });
  }

  /**
   * Activate a tenant.
   */
  async activateTenant(id, currentUserId) {
    await this.getTenant(id);
    await tenantRepository.activate(id);
    
    eventBus.publish('tenant:activated', { tenantId: id, activatedBy: currentUserId });
  }

  /**
   * List all tenants (System Admin level operation).
   */
  async listTenants(options) {
    return tenantRepository.findAll(options);
  }
}

module.exports = new TenantService();
