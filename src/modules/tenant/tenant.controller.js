const tenantService = require('./tenant.service');
const { createTenantSchema, updateTenantSchema, tenantIdParam, paginationQuery } = require('./tenant.validator');

class TenantController {
  /**
   * Only Super Admins can list all tenants
   */
  async list(req, res) {
    const options = paginationQuery.parse(req.query);
    const result = await tenantService.listTenants(options);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  }

  /**
   * Only Super Admins can create new tenants via API directly
   */
  async create(req, res) {
    const data = createTenantSchema.parse(req.body);
    const tenant = await tenantService.createTenant(data);
    
    res.status(201).json({
      success: true,
      message: req.t('tenant.created'),
      data: tenant,
    });
  }

  /**
   * Get current tenant details (for tenant admins) or specific tenant (for Super Admins)
   */
  async get(req, res) {
    // If SuperAdmin passes ID, get that tenant. Otherwise, get the tenant of the current user.
    const id = req.params.id || req.tenantId;
    const tenant = await tenantService.getTenant(id);
    
    res.status(200).json({
      success: true,
      data: tenant,
    });
  }

  /**
   * Update tenant
   */
  async update(req, res) {
    const id = req.params.id || req.tenantId;
    const data = updateTenantSchema.parse(req.body);
    const tenant = await tenantService.updateTenant(id, data, req.user.userId);
    
    res.status(200).json({
      success: true,
      message: req.t('tenant.updated'),
      data: tenant,
    });
  }

  /**
   * Suspend a tenant (Super Admin only)
   */
  async suspend(req, res) {
    const { id } = tenantIdParam.parse(req.params);
    await tenantService.suspendTenant(id, req.user.userId);
    
    res.status(200).json({
      success: true,
      message: req.t('tenant.suspended'),
    });
  }

  /**
   * Activate a tenant (Super Admin only)
   */
  async activate(req, res) {
    const { id } = tenantIdParam.parse(req.params);
    await tenantService.activateTenant(id, req.user.userId);
    
    res.status(200).json({
      success: true,
      message: req.t('tenant.activated'),
    });
  }
}

module.exports = new TenantController();
