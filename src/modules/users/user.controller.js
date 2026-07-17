const userService = require('./user.service');
const { updateUserSchema, assignRoleSchema, userIdParam, paginationQuery } = require('./user.validator');

class UserController {
  async list(req, res) {
    const options = paginationQuery.parse(req.query);
    const result = await userService.getTenantUsers(req.tenantId, options);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  }

  async get(req, res) {
    const { id } = userIdParam.parse(req.params);
    const user = await userService.getUser(id, req.tenantId);
    
    res.status(200).json({
      success: true,
      data: user,
    });
  }

  async update(req, res) {
    const { id } = userIdParam.parse(req.params);
    const data = updateUserSchema.parse(req.body);
    
    const user = await userService.updateUser(id, req.tenantId, data, req.user.userId);
    
    res.status(200).json({
      success: true,
      message: req.t('user.updated'),
      data: user,
    });
  }

  async assignRole(req, res) {
    const { id } = userIdParam.parse(req.params);
    const { role } = assignRoleSchema.parse(req.body);
    
    await userService.assignRole(id, req.tenantId, role, req.user.userId);
    
    res.status(200).json({
      success: true,
      message: req.t('user.role_assigned'),
    });
  }

  async removeRole(req, res) {
    const { id } = userIdParam.parse(req.params);
    const { role } = assignRoleSchema.parse(req.params); // assuming passed as param in routes /:id/roles/:role
    
    await userService.removeRole(id, req.tenantId, role, req.user.userId);
    
    res.status(200).json({
      success: true,
      message: req.t('user.role_removed'),
    });
  }

  async deactivate(req, res) {
    const { id } = userIdParam.parse(req.params);
    
    await userService.deactivateUser(id, req.tenantId, req.user.userId);
    
    res.status(200).json({
      success: true,
      message: req.t('user.deactivated'),
    });
  }

  async activate(req, res) {
    const { id } = userIdParam.parse(req.params);
    
    await userService.activateUser(id, req.tenantId, req.user.userId);
    
    res.status(200).json({
      success: true,
      message: req.t('user.activated'),
    });
  }
}

module.exports = new UserController();
