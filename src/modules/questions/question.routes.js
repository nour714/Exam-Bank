const { Router } = require('express');
const controller = require('./question.controller');
const { authenticate, authorize } = require('../../shared/middlewares');
const { ROLES } = require('../../shared/constants');

const router = Router();

router.use(authenticate);

router.get('/', controller.listQuestions);
router.post('/', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.TEACHER), controller.createQuestion);

module.exports = router;
