const { Router } = require('express');
const controller = require('./user.controller');
const { authenticate, authorize } = require('../../shared/middlewares');
const { ROLES } = require('../../shared/constants');

const router = Router();

// All user routes require authentication
router.use(authenticate);

// ─── User Profile ──────────────────────────────────────────
// Any user can update their own profile, handled by /auth/me or a separate route.
// Currently, these routes are for tenant administration.
router.get('/', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), controller.list);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), controller.get);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), controller.update);

// ─── Roles & Status ────────────────────────────────────────
router.post('/:id/roles', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), controller.assignRole);
router.delete('/:id/roles/:role', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), controller.removeRole);
router.post('/:id/deactivate', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), controller.deactivate);
router.post('/:id/activate', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), controller.activate);

module.exports = router;
