const express = require('express');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const { httpLogger } = require('../shared/logger');
const { i18nMiddleware } = require('../shared/i18n');

function setupGateway(app) {
  // 1. Request ID & Correlation ID
  app.use((req, res, next) => {
    req.id = req.headers['x-request-id'] || crypto.randomUUID();
    req.correlationId = req.headers['x-correlation-id'] || req.id;
    res.setHeader('X-Request-Id', req.id);
    res.setHeader('X-Correlation-Id', req.correlationId);
    next();
  });

  // 2. Structured HTTP logging
  app.use(httpLogger);

  // 3. Security headers - handled by security.js middleware (no duplicate helmet() here)

  // 4. CORS
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5000',
    credentials: true,
  }));

  // 5. Body parsing & compression
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(compression());

  // 6. Internationalization
  app.use(i18nMiddleware);

  // 7. Tenant context extraction (placeholder for Phase 3)
  app.use((req, res, next) => {
    // Will be populated by Auth middleware in Phase 3
    req.tenantId = req.headers['x-tenant-id'] || null;
    next();
  });
}

module.exports = {
  setupGateway,
};
