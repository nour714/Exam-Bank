const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate a JWT access token.
 * @param {Object} payload - Data to encode in the token (userId, tenantId, roles).
 * @returns {string} Signed JWT.
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
    issuer: 'exam-bank',
    audience: 'exam-bank-client',
  });
}

/**
 * Generate a JWT refresh token.
 * @param {Object} payload - Minimal data (userId, family).
 * @returns {string} Signed JWT.
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
    issuer: 'exam-bank',
    audience: 'exam-bank-client',
  });
}

/**
 * Verify and decode a JWT access token.
 * @param {string} token - The JWT to verify.
 * @returns {Object} Decoded payload.
 * @throws {jwt.JsonWebTokenError|jwt.TokenExpiredError}
 */
function verifyAccessToken(token) {
  return jwt.verify(token, config.JWT_SECRET, {
    issuer: 'exam-bank',
    audience: 'exam-bank-client',
  });
}

/**
 * Verify and decode a JWT refresh token.
 * @param {string} token - The refresh JWT to verify.
 * @returns {Object} Decoded payload.
 * @throws {jwt.JsonWebTokenError|jwt.TokenExpiredError}
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, config.JWT_REFRESH_SECRET, {
    issuer: 'exam-bank',
    audience: 'exam-bank-client',
  });
}

/**
 * Parse the expiry duration string (e.g., "7d", "15m") into milliseconds.
 * @param {string} duration - Duration string.
 * @returns {number} Duration in milliseconds.
 */
function parseDuration(duration) {
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid duration format: ${duration}`);
  return parseInt(match[1], 10) * units[match[2]];
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  parseDuration,
};
