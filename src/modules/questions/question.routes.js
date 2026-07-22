const { Router } = require('express');
const controller = require('./question.controller');
const { authenticate, authorize } = require('../../shared/middlewares');
const { ROLES } = require('../../shared/constants');
const catchAsync = require('../../shared/utils/catchAsync');

const router = Router();

router.use(authenticate);

router.get('/', catchAsync(controller.listQuestions));
router.post('/', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.TEACHER), catchAsync(controller.createQuestion));

module.exports = router;
