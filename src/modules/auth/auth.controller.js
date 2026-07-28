const authService = require('./auth.service');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} = require('./auth.validator');

/**
 * Auth controller — extracts request data, validates via Zod, delegates to AuthService,
 * and formats HTTP responses. No business logic lives here.
 */
class AuthController {
  constructor() {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.refresh = this.refresh.bind(this);
    this.logout = this.logout.bind(this);
    this.logoutAll = this.logoutAll.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.getSessions = this.getSessions.bind(this);
    this.revokeSession = this.revokeSession.bind(this);
    this.getLoginHistory = this.getLoginHistory.bind(this);
    this.me = this.me.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
  }

  /**
   * POST /api/v1/auth/register
   */
  async register(req, res) {
    const data = registerSchema.parse(req.body);
    const tenantId = req.tenantId || req.headers['x-tenant-id'] || req.body?.tenantId || 'default-tenant';

    const user = await authService.register(data, tenantId);

    res.status(201).json({
      success: true,
      message: req.t('auth.register_success'),
      data: { user },
    });
  }

  /**
   * POST /api/v1/auth/login
   */
  async login(req, res) {
    const credentials = loginSchema.parse(req.body);
    const meta = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };

    const result = await authService.login(credentials, meta);

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/v1/auth',
    });

    res.status(200).json({
      success: true,
      message: req.t('auth.login_success'),
      data: {
        user: result.user,
        accessToken: result.accessToken,
        session: result.session,
      },
    });
  }

  /**
   * POST /api/v1/auth/refresh
   */
  async refresh(req, res) {
    // Prefer cookie, fall back to body
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: { message: 'Refresh token is required' },
      });
    }

    const meta = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };

    const result = await authService.refresh(refreshToken, meta);

    // Update cookie with new refresh token
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth',
    });

    res.status(200).json({
      success: true,
      data: { accessToken: result.accessToken },
    });
  }

  /**
   * POST /api/v1/auth/logout
   */
  async logout(req, res) {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    await authService.logout(refreshToken, req.user?.userId);

    res.clearCookie('refreshToken', { path: '/api/v1/auth' });

    res.status(200).json({
      success: true,
      message: req.t('auth.logout_success'),
    });
  }

  /**
   * POST /api/v1/auth/logout-all
   */
  async logoutAll(req, res) {
    await authService.logoutAll(req.user.userId);

    res.clearCookie('refreshToken', { path: '/api/v1/auth' });

    res.status(200).json({
      success: true,
      message: 'All sessions revoked',
    });
  }

  /**
   * PUT /api/v1/auth/password
   */
  async changePassword(req, res) {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    await authService.changePassword(req.user.userId, currentPassword, newPassword);

    res.clearCookie('refreshToken', { path: '/api/v1/auth' });

    res.status(200).json({
      success: true,
      message: req.t('auth.password_changed'),
    });
  }

  /**
   * GET /api/v1/auth/sessions
   */
  async getSessions(req, res) {
    const sessions = await authService.getSessions(req.user.userId);

    res.status(200).json({
      success: true,
      data: sessions,
    });
  }

  /**
   * DELETE /api/v1/auth/sessions/:id
   */
  async revokeSession(req, res) {
    await authService.revokeSession(req.params.id, req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Session revoked',
    });
  }

  /**
   * GET /api/v1/auth/login-history
   */
  async getLoginHistory(req, res) {
    const history = await authService.getLoginHistory(req.user.userId);

    res.status(200).json({
      success: true,
      data: history,
    });
  }

  /**
   * GET /api/v1/auth/me
   */
  async me(req, res) {
    const userRepository = require('../users/user.repository');
    const user = await userRepository.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: req.t ? req.t('user.not_found') : 'User not found' },
      });
    }

    const { passwordHash, ...safeUser } = user;

    res.status(200).json({
      success: true,
      data: safeUser,
    });
  }

  /**
   * PUT /api/v1/auth/me or /api/v1/auth/profile
   */
  async updateProfile(req, res) {
    const userRepository = require('../users/user.repository');
    const { firstName, lastName, avatar, locale, name, grade, pathway, emailNotifications, examReminders } = req.body;
    
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (name && !firstName) {
      const parts = name.trim().split(/\s+/);
      updateData.firstName = parts[0];
      updateData.lastName = parts.slice(1).join(' ') || parts[0];
    }
    if (avatar !== undefined) updateData.avatar = avatar;
    if (locale !== undefined) updateData.locale = locale;
    if (grade !== undefined) updateData.grade = grade;
    if (pathway !== undefined) updateData.pathway = pathway;
    if (emailNotifications !== undefined) updateData.emailNotifications = !!emailNotifications;
    if (examReminders !== undefined) updateData.examReminders = !!examReminders;

    const updatedUser = await userRepository.update(req.user.userId, updateData);
    const { passwordHash, ...safeUser } = updatedUser;

    res.status(200).json({
      success: true,
      data: safeUser,
    });
  }
}

module.exports = new AuthController();
