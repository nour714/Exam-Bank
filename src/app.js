const express = require('express');
const { logger } = require('./shared/logger');
const { ZodError } = require('zod');
const { setupGateway } = require('./gateway');
const { featureFlagRoutes } = require('./modules/feature-flags');
const { settingsRoutes } = require('./modules/settings');
const { securityMiddleware, metricsMiddleware, metricsEndpoint } = require('./shared/middlewares');

// Phase 2 Modules
const { authRoutes } = require('./modules/auth');
const { userRoutes } = require('./modules/users');
const { tenantRoutes } = require('./modules/tenant');

// Phase 4 Modules
const { curriculumRoutes } = require('./modules/curriculum');
const { questionRoutes } = require('./modules/questions');
const { examRoutes } = require('./modules/exams');
const { engineRoutes } = require('./modules/engine');
const { analyticsRoutes } = require('./modules/analytics');

// Phase 7 Modules
const { billingRoutes } = require('./modules/billing');
const { pluginRoutes } = require('./modules/plugins');
const { webhookRoutes } = require('./modules/webhooks');
const { studyGroupRoutes } = require('./modules/study-groups');


const compression = require('compression');
const cookieParser = require('cookie-parser');

const app = express();

// ─── 0. Security & Observability ───────────────────────────────
// NOTE: CORS is configured in gateway/index.js with restricted origins
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(securityMiddleware);
app.use(metricsMiddleware);

app.get('/metrics', metricsEndpoint);

// ─── 0.1 Health Probes ─────────────────────────────────────────
app.get('/health/liveness', (req, res) => {
  res.status(200).json({ status: 'alive' });
});
app.get('/health/readiness', async (req, res) => {
  // In a real scenario, ping the DB and Redis here
  // If down, return 503
  res.status(200).json({ status: 'ready' });
});

// ─── 0.2 API Documentation (Swagger) ────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  const swaggerUi = require('swagger-ui-express');
  const YAML = require('yamljs');
  const path = require('path');
  const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'openapi.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// ─── 1. Gateway Layer ──────────────────────────────────────────
setupGateway(app);

// ─── 2. Health & Metrics ───────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─── 3. API v1 Routes ──────────────────────────────────────────
const apiRouter = express.Router();

apiRouter.use('/feature-flags', featureFlagRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/tenants', tenantRoutes);
apiRouter.use('/curriculums', curriculumRoutes);
apiRouter.use('/questions', questionRoutes);
apiRouter.use('/exams', examRoutes);
apiRouter.use('/engine', engineRoutes);
apiRouter.use('/analytics', analyticsRoutes);

// Phase 7
apiRouter.use('/billing', billingRoutes);
apiRouter.use('/plugins', pluginRoutes);
apiRouter.use('/webhooks', webhookRoutes);
apiRouter.use('/study-groups', studyGroupRoutes);

app.use('/api/v1', apiRouter);

// ─── 4. Frontend static serving (SPA) ──────────────────────────
const path = require('path');
const frontendPath = path.join(__dirname, '..', 'frontend');

app.use(express.static(path.join(frontendPath, 'public')));
app.use('/src', express.static(path.join(frontendPath, 'src')));

// SPA fallback
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendPath, 'public', 'index.html'));
});

// ─── 5. 404 Handler (for API) ──────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: req.t ? req.t('common.not_found') : 'Not Found' },
  });
});

// ─── 6. Zod Validation Error Handler ──────────────────────────
app.use((err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        message: req.t ? req.t('common.validation_error') : 'Validation error',
        details: err.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }
  next(err);
});

// ─── 7. Global Error Handler (ALWAYS LAST) ────────────────────
app.use((err, req, res, next) => {
  logger.error(err);
  const status = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : (req.t ? req.t('common.server_error') : 'Internal Server Error');

  res.status(status).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

module.exports = app;
