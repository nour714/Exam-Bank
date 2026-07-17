const { Router } = require('express');
const controller = require('./webhook.controller');
const { authenticate, authorize } = require('../../shared/middlewares');
const { ROLES } = require('../../shared/constants');

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/', controller.getEndpoints);
router.post('/', controller.createEndpoint);

module.exports = router;
