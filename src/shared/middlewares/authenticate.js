const { verifyAccessToken } = require('../security');
const { UnauthorizedError } = require('../errors');
const { logger } = require('../logger');

/**
 * Express middleware to authenticate requests using JWT Bearer tokens.
 * Extracts the token from the Authorization header, verifies it,
 * and attaches the decoded payload to `req.user`.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Access token is required');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      roles: decoded.roles || [],
    };
    // Override tenantId from token (trusted source) if present
    if (decoded.tenantId) {
      req.tenantId = decoded.tenantId;
    }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Access token has expired');
    }
    logger.warn({ error: err.message }, 'JWT verification failed');
    throw new UnauthorizedError('Invalid access token');
  }
}

module.exports = authenticate;
