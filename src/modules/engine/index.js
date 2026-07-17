const engineRoutes = require('./engine.routes');
const engineService = require('./engine.service');
const engineRepository = require('./engine.repository');
const GradingEngine = require('./grading.engine');

module.exports = {
  engineRoutes,
  engineService,
  engineRepository,
  GradingEngine,
};
