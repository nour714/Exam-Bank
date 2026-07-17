// tests/helpers/auth.helper.js
const jwt = require('jsonwebtoken');

/**
 * Generate a mock JWT token for testing API endpoints.
 */
function generateTestToken(userOverride = {}) {
  const payload = {
    userId: userOverride.id || '123e4567-e89b-12d3-a456-426614174000',
    tenantId: userOverride.tenantId || 'tenant-1',
    role: userOverride.role || 'STUDENT',
    ...userOverride,
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
}

module.exports = {
  generateTestToken,
};
