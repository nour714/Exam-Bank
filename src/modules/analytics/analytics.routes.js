const { Router } = require('express');
const controller = require('./analytics.controller');
const { authenticate, authorize } = require('../../shared/middlewares');
const { ROLES } = require('../../shared/constants');

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.TEACHER));

router.get('/tenant', controller.getTenantStats);
router.get('/questions/:questionId', controller.getQuestionAnalytics);

module.exports = router;
