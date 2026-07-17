const { Router } = require('express');
const controller = require('./plugin.controller');
const { authenticate, authorize } = require('../../shared/middlewares');
const { ROLES } = require('../../shared/constants');

const router = Router();

router.use(authenticate);

// Marketplace (visible to admins)
router.get('/marketplace', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), controller.getMarketplace);

// Tenant installations
router.get('/installed', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), controller.getInstalled);
router.post('/:pluginId/install', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), controller.install);
router.delete('/:pluginId', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), controller.uninstall);
router.patch('/:pluginId/config', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), controller.updateConfig);

module.exports = router;
