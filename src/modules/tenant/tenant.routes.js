const { Router } = require('express');
const controller = require('./tenant.controller');
const { authenticate, authorize } = require('../../shared/middlewares');
const { ROLES } = require('../../shared/constants');

const router = Router();

// All tenant routes require authentication
router.use(authenticate);

// ─── Tenant Admin Routes (Current Tenant) ──────────────────
// An admin of a tenant can view and update their own tenant details
router.get('/me', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), controller.get);
router.put('/me', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), controller.update);

// ─── Super Admin Routes (All Tenants) ──────────────────────
router.get('/', authorize(ROLES.SUPER_ADMIN), controller.list);
router.post('/', authorize(ROLES.SUPER_ADMIN), controller.create);
router.get('/:id', authorize(ROLES.SUPER_ADMIN), controller.get);
router.put('/:id', authorize(ROLES.SUPER_ADMIN), controller.update);
router.post('/:id/suspend', authorize(ROLES.SUPER_ADMIN), controller.suspend);
router.post('/:id/activate', authorize(ROLES.SUPER_ADMIN), controller.activate);

module.exports = router;
