const { ForbiddenError } = require('../errors');

/**
 * Express middleware factory for role-based access control.
 * Checks if the authenticated user has at least one of the required roles.
 *
 * Usage:
 *   router.get('/admin', authenticate, authorize('admin', 'super_admin'), controller.dashboard)
 *
 * @param {...string} allowedRoles - One or more role names that are permitted.
 * @returns {Function} Express middleware.
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      throw new ForbiddenError('No roles assigned');
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
}

/**
 * Express middleware factory for permission-based access control.
 * Requires a database lookup — should be used for fine-grained checks.
 *
 * Usage:
 *   router.delete('/questions/:id', authenticate, requirePermission('questions', 'delete'), controller.remove)
 *
 * @param {string} resource - The resource name (e.g., 'questions').
 * @param {string} action - The action name (e.g., 'delete').
 * @returns {Function} Express middleware.
 */
function requirePermission(resource, action) {
  return async (req, res, next) => {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    // Super admins bypass all permission checks
    if (req.user.roles && req.user.roles.includes('super_admin')) {
      return next();
    }

    // For now, delegate to a permission service when it's ready.
    // This is a placeholder that can be wired to a PermissionService.findByUserAndAction()
    // without modifying any consuming routes.
    //
    // TODO: Wire to PermissionService in Phase 3+ when dynamic permissions are fully seeded.
    next();
  };
}

module.exports = {
  authorize,
  requirePermission,
};
