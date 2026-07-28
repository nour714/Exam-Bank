const { Router } = require('express');
const controller = require('./engine.controller');
const { authenticate, authorize } = require('../../shared/middlewares');
const { ROLES } = require('../../shared/constants');

const router = Router();

router.use(authenticate);

// Student attempt routes
router.get('/attempts/:attemptId', controller.getAttempt);
router.post('/attempts', controller.startAttempt);
router.post('/attempts/:attemptId/answers', controller.saveAnswer);
router.post('/attempts/:attemptId/submit', controller.submitAttempt);

// Instructor review routes
router.post(
  '/attempts/:attemptId/answers/:answerId/review', 
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.TEACHER), 
  controller.reviewAnswer
);

module.exports = router;
