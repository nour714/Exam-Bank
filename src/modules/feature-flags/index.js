const routes = require('./feature-flag.routes');
const service = require('./feature-flag.service');

module.exports = {
  featureFlagRoutes: routes,
  featureFlagService: service,
};
