const { Router } = require('express');
const controller = require('./auth.controller');
const { authenticate } = require('../../shared/middlewares');
const catchAsync = require('../../shared/utils/catchAsync');

const router = Router();

// ─── Public Routes ─────────────────────────────────────────
router.post('/register', catchAsync(controller.register));
router.post('/login', catchAsync(controller.login));
router.post('/refresh', catchAsync(controller.refresh));

// ─── Protected Routes ──────────────────────────────────────
router.post('/logout', authenticate, catchAsync(controller.logout));
router.post('/logout-all', authenticate, catchAsync(controller.logoutAll));
router.put('/password', authenticate, catchAsync(controller.changePassword));
router.get('/me', authenticate, catchAsync(controller.me));
router.put('/me', authenticate, catchAsync(controller.updateProfile));
router.put('/profile', authenticate, catchAsync(controller.updateProfile));
router.get('/sessions', authenticate, catchAsync(controller.getSessions));
router.delete('/sessions/:id', authenticate, catchAsync(controller.revokeSession));
router.get('/login-history', authenticate, catchAsync(controller.getLoginHistory));

module.exports = router;
