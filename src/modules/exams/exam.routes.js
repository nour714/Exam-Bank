const { Router } = require('express');
const controller = require('./exam.controller');
const { authenticate, authorize } = require('../../shared/middlewares');
const { ROLES } = require('../../shared/constants');

const router = Router();

router.use(authenticate);

router.get('/', controller.listExams);
router.get('/:id', controller.getExamDetails);
router.post('/', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.TEACHER), controller.createExam);
router.post('/:id/publish', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.TEACHER), controller.publishExam);

module.exports = router;
