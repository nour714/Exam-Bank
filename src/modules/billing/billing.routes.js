const { Router } = require('express');
const controller = require('./billing.controller');
const { authenticate, authorize } = require('../../shared/middlewares');
const { ROLES } = require('../../shared/constants');

const router = Router();

// Payment Webhook (No JWT authentication, uses signature verification via payment service)
router.post('/webhooks/payment', controller.handlePaymentWebhook);

// Protected routes
router.use(authenticate);

router.get('/plans', controller.getPlans);
router.get('/subscription', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), controller.getSubscription);

module.exports = router;
