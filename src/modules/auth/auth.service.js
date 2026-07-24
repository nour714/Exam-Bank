const crypto = require('crypto');
const { logger } = require('../../shared/logger');
const { eventBus } = require('../../shared/events');
const {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  parseDuration,
} = require('../../shared/security');
const {
  LOGIN_STATUS,
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION_MINUTES,
  ROLES,
  AUDIT_ACTIONS,
} = require('../../shared/constants');
const { UnauthorizedError, BadRequestError, ForbiddenError } = require('../../shared/errors');
const config = require('../../shared/config');
const authRepository = require('./auth.repository');
const userRepository = require('../users/user.repository');
const authEvents = require('./auth.events');

/**
 * AuthService encapsulates all authentication business logic:
 * registration, login, logout, token rotation, account lockout, and session management.
 */
class AuthService {
  /**
   * Register a new user account.
   * @param {Object} data - Validated registration data.
   * @param {string} tenantId - The tenant to register under.
   * @returns {Promise<Object>} The created user (without password hash).
   */
  async register(data, tenantId) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestError('Email already in use');
    }

    const passwordHash = await hashPassword(data.password);

    const user = await userRepository.create({
      tenantId,
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      locale: data.locale || 'ar',
    });

    // Assign default student role
    await userRepository.assignRole(user.id, ROLES.STUDENT);

    // Emit domain event
    eventBus.publish(authEvents.USER_REGISTERED, {
      userId: user.id,
      email: user.email,
      tenantId,
    });

    // Audit
    await authRepository.createAuditLog({
      userId: user.id,
      action: AUDIT_ACTIONS.CREATE,
      resource: 'user',
      resourceId: user.id,
      newData: { email: user.email, firstName: user.firstName, lastName: user.lastName },
    });

    return this._sanitizeUser(user);
  }

  /**
   * Authenticate a user and return access + refresh tokens.
   * Implements account lockout after MAX_LOGIN_ATTEMPTS failures.
   * @param {Object} credentials - { email, password }
   * @param {Object} meta - { ipAddress, userAgent }
   * @returns {Promise<Object>} { user, accessToken, refreshToken, session }
   */
  async login(credentials, meta = {}) {
    const user = await userRepository.findByEmail(credentials.email);

    // User not found — record nothing to avoid user enumeration timing attacks
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await this._recordLoginAttempt(user.id, LOGIN_STATUS.FAILED_LOCKED, meta);
      throw new ForbiddenError('Account is temporarily locked. Please try again later');
    }

    // Check if account is active
    if (!user.isActive) {
      await this._recordLoginAttempt(user.id, LOGIN_STATUS.FAILED_INACTIVE, meta);
      throw new ForbiddenError('Account is deactivated');
    }

    // Verify password
    const isValid = await comparePassword(credentials.password, user.passwordHash);
    if (!isValid) {
      await this._handleFailedLogin(user, meta);
      throw new UnauthorizedError('Invalid email or password');
    }

    // Success — reset failed attempts and generate tokens
    await userRepository.update(user.id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    });

    const tokenFamily = crypto.randomUUID();
    const { accessToken, refreshToken, refreshTokenRecord } = await this._generateTokenPair(user, tokenFamily, meta);

    // Create session
    const session = await authRepository.createSession({
      userId: user.id,
      userAgent: meta.userAgent || null,
      ipAddress: meta.ipAddress || null,
      deviceName: this._parseDeviceName(meta.userAgent),
      expiresAt: new Date(Date.now() + parseDuration(config.JWT_REFRESH_EXPIRES_IN)),
    });

    // Record successful login
    await this._recordLoginAttempt(user.id, LOGIN_STATUS.SUCCESS, meta);

    // Emit domain event
    eventBus.publish(authEvents.USER_LOGGED_IN, {
      userId: user.id,
      sessionId: session.id,
      ipAddress: meta.ipAddress,
    });

    return {
      user: this._sanitizeUser(user),
      accessToken,
      refreshToken,
      session,
    };
  }

  /**
   * Refresh an access token using a valid refresh token.
   * Implements token rotation: the old refresh token is revoked and a new one is issued.
   * Detects token reuse (replay attack) and revokes the entire token family.
   * @param {string} token - The current refresh token.
   * @param {Object} meta - { ipAddress, userAgent }
   * @returns {Promise<Object>} { accessToken, refreshToken }
   */
  async refresh(token, meta = {}) {
    // Verify JWT signature and expiry
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Look up the token record in the database
    const storedToken = await authRepository.findRefreshTokenByToken(token);

    if (!storedToken) {
      throw new UnauthorizedError('Refresh token not found');
    }

    // Token reuse detection: if this token was already revoked, an attacker may be replaying it.
    // Revoke the entire family to protect the user.
    if (storedToken.revokedAt) {
      logger.warn(
        { userId: storedToken.userId, family: storedToken.family },
        'Token reuse detected — revoking entire family'
      );
      await authRepository.revokeTokenFamily(storedToken.family);

      eventBus.publish(authEvents.TOKEN_REUSE_DETECTED, {
        userId: storedToken.userId,
        family: storedToken.family,
        ipAddress: meta.ipAddress,
      });

      throw new UnauthorizedError('Token reuse detected. Please log in again');
    }

    // Check expiry at DB level
    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token has expired');
    }

    const user = storedToken.user;
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account is inactive');
    }

    // Rotate: revoke old token and issue a new pair
    const { accessToken, refreshToken: newRefreshToken, refreshTokenRecord } =
      await this._generateTokenPair(user, storedToken.family, meta);

    await authRepository.revokeRefreshToken(storedToken.id, refreshTokenRecord.id);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Log out a user by revoking the current refresh token and deactivating the session.
   * @param {string} refreshToken - The current refresh token.
   * @param {string} userId - The authenticated user's ID.
   * @returns {Promise<void>}
   */
  async logout(refreshToken, userId) {
    if (refreshToken) {
      const storedToken = await authRepository.findRefreshTokenByToken(refreshToken);
      if (storedToken && !storedToken.revokedAt) {
        await authRepository.revokeRefreshToken(storedToken.id);
      }
    }

    eventBus.publish(authEvents.USER_LOGGED_OUT, { userId });
  }

  /**
   * Log out from all devices by revoking all tokens and sessions.
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async logoutAll(userId) {
    await authRepository.revokeAllUserTokens(userId);
    await authRepository.deactivateAllUserSessions(userId);

    eventBus.publish(authEvents.ALL_SESSIONS_REVOKED, { userId });
  }

  /**
   * Change password for a logged-in user.
   * @param {string} userId
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<void>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new BadRequestError('User not found');
    }

    const isValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const newHash = await hashPassword(newPassword);
    await userRepository.update(userId, { passwordHash: newHash });

    // Revoke all existing tokens for security
    await authRepository.revokeAllUserTokens(userId);
    await authRepository.deactivateAllUserSessions(userId);

    await authRepository.createAuditLog({
      userId,
      action: AUDIT_ACTIONS.PASSWORD_CHANGE,
      resource: 'user',
      resourceId: userId,
    });

    eventBus.publish(authEvents.USER_PASSWORD_CHANGED, { userId });
  }

  /**
   * Get active sessions for a user.
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async getSessions(userId) {
    return authRepository.findActiveSessionsByUser(userId);
  }

  /**
   * Revoke a specific session.
   * @param {string} sessionId
   * @param {string} userId - For authorization check.
   * @returns {Promise<void>}
   */
  async revokeSession(sessionId, userId) {
    await authRepository.deactivateSession(sessionId);
  }

  /**
   * Get login history for a user.
   * @param {string} userId
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getLoginHistory(userId, limit = 20) {
    return authRepository.getLoginHistory(userId, limit);
  }

  // ─── Private Helpers ─────────────────────────────────────

  /**
   * Handle a failed login attempt: increment counter, lock if threshold reached.
   * @private
   */
  async _handleFailedLogin(user, meta) {
    const attempts = user.failedLoginAttempts + 1;
    const updateData = { failedLoginAttempts: attempts };

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
      logger.warn({ userId: user.id, attempts }, 'Account locked due to too many failed attempts');

      eventBus.publish(authEvents.USER_ACCOUNT_LOCKED, {
        userId: user.id,
        lockedUntil: updateData.lockedUntil,
      });
    }

    await userRepository.update(user.id, updateData);
    await this._recordLoginAttempt(user.id, LOGIN_STATUS.FAILED_CREDENTIALS, meta);
  }

  /**
   * Record a login attempt in the LoginHistory table.
   * @private
   */
  async _recordLoginAttempt(userId, status, meta) {
    await authRepository.createLoginHistory({
      userId,
      ipAddress: meta.ipAddress || null,
      userAgent: meta.userAgent || null,
      status,
    });
  }

  /**
   * Generate an access + refresh token pair and persist the refresh token.
   * @private
   */
  async _generateTokenPair(user, family, meta) {
    const roles = (user.roles || []).map((ur) => ur.role?.name || ur.roleName);

    const accessToken = generateAccessToken({
      userId: user.id,
      tenantId: user.tenantId,
      roles,
    });

    const refreshTokenValue = generateRefreshToken({
      userId: user.id,
      family,
    });

    const refreshTokenRecord = await authRepository.createRefreshToken({
      userId: user.id,
      token: refreshTokenValue,
      family,
      expiresAt: new Date(Date.now() + parseDuration(config.JWT_REFRESH_EXPIRES_IN)),
      userAgent: meta.userAgent || null,
      ipAddress: meta.ipAddress || null,
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      refreshTokenRecord,
    };
  }

  /**
   * Parse a rough device name from a User-Agent string.
   * @private
   */
  _parseDeviceName(userAgent) {
    if (!userAgent) return 'Unknown Device';
    if (userAgent.includes('Mobile')) return 'Mobile Browser';
    if (userAgent.includes('Tablet')) return 'Tablet Browser';
    return 'Desktop Browser';
  }

  /**
   * Remove sensitive fields from a user object before returning it.
   * @private
   */
  _sanitizeUser(user) {
    const { passwordHash, failedLoginAttempts, lockedUntil, ...safeUser } = user;
    return safeUser;
  }
}

module.exports = new AuthService();
