const client = require('prom-client');

// 1. Initialize Default Node.js Metrics (CPU, Event Loop Lag, Memory)
const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'exambank_' });

// 2. Custom Application Metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'exambank_http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000],
  registers: [register],
});

/**
 * Middleware to track HTTP request durations.
 */
const metricsMiddleware = (req, res, next) => {
  const startEpoch = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startEpoch;
    // For route cardinality, we ideally use req.route.path instead of req.path
    // to avoid an explosion of metrics for /users/1, /users/2, etc.
    const route = req.route ? req.route.path : req.path;
    httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode)
      .observe(duration);
  });

  next();
};

/**
 * Endpoint to expose metrics to Prometheus scraper.
 */
const metricsEndpoint = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
};

module.exports = {
  metricsMiddleware,
  metricsEndpoint,
  register, // Export registry if other services need to register custom metrics
};
