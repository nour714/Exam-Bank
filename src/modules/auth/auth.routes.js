const { Router } = require('express');
const controller = require('./auth.controller');
const { authenticate } = require('../../shared/middlewares');

const router = Router();

// ─── Public Routes ─────────────────────────────────────────
router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/refresh', controller.refresh);

// ─── Protected Routes ──────────────────────────────────────
router.post('/logout', authenticate, controller.logout);
router.post('/logout-all', authenticate, controller.logoutAll);
router.put('/password', authenticate, controller.changePassword);
router.get('/me', authenticate, controller.me);
router.get('/sessions', authenticate, controller.getSessions);
router.delete('/sessions/:id', authenticate, controller.revokeSession);
router.get('/login-history', authenticate, controller.getLoginHistory);

module.exports = router;
