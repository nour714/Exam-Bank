const { getPrismaClient } = require('../../shared/database');

/**
 * Repository for authentication-related data operations.
 * Handles RefreshToken, Session, and LoginHistory persistence.
 */
class AuthRepository {
  constructor() {
    this._prisma = null;
  }

  get prisma() {
    if (!this._prisma) {
      this._prisma = getPrismaClient();
    }
    return this._prisma;
  }

  // ─── Refresh Tokens ──────────────────────────────────────

  /**
   * Create a new refresh token record.
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createRefreshToken(data) {
    return this.prisma.refreshToken.create({ data });
  }

  /**
   * Find a refresh token by its token string.
   * @param {string} token
   * @returns {Promise<Object|null>}
   */
  async findRefreshTokenByToken(token) {
    return this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { include: { roles: { include: { role: true } } } } },
    });
  }

  /**
   * Revoke a single refresh token.
   * @param {string} id - Token record ID.
   * @param {string|null} replacedBy - ID of the replacement token (for rotation tracking).
   * @returns {Promise<Object>}
   */
  async revokeRefreshToken(id, replacedBy = null) {
    return this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date(), replacedBy },
    });
  }

  /**
   * Revoke all refresh tokens in a family (used when token reuse is detected).
   * @param {string} family - The token family identifier.
   * @returns {Promise<Object>}
   */
  async revokeTokenFamily(family) {
    return this.prisma.refreshToken.updateMany({
      where: { family, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Revoke all refresh tokens for a user (used on logout-all or password change).
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async revokeAllUserTokens(userId) {
    return this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Delete expired refresh tokens (cleanup job).
   * @returns {Promise<Object>}
   */
  async deleteExpiredTokens() {
    return this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }

  // ─── Sessions ────────────────────────────────────────────

  /**
   * Create a new session.
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createSession(data) {
    return this.prisma.session.create({ data });
  }

  /**
   * Find all active sessions for a user.
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async findActiveSessionsByUser(userId) {
    return this.prisma.session.findMany({
      where: { userId, isActive: true, expiresAt: { gt: new Date() } },
      orderBy: { lastSeenAt: 'desc' },
    });
  }

  /**
   * Deactivate a session.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async deactivateSession(id) {
    return this.prisma.session.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Deactivate all sessions for a user.
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async deactivateAllUserSessions(userId) {
    return this.prisma.session.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
  }

  /**
   * Update the lastSeenAt timestamp for a session.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async touchSession(id) {
    return this.prisma.session.update({
      where: { id },
      data: { lastSeenAt: new Date() },
    });
  }

  // ─── Login History ───────────────────────────────────────

  /**
   * Record a login attempt.
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createLoginHistory(data) {
    return this.prisma.loginHistory.create({ data });
  }

  /**
   * Get recent login history for a user.
   * @param {string} userId
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getLoginHistory(userId, limit = 20) {
    return this.prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // ─── Audit Log ───────────────────────────────────────────

  /**
   * Record an audit log entry.
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createAuditLog(data) {
    return this.prisma.auditLog.create({ data });
  }
}

module.exports = new AuthRepository();
