/**
 * Lightweight template engine for notification content.
 * Supports variable interpolation and conditional sections.
 *
 * Templates are stored as plain strings with {{variable}} placeholders.
 * Future: Load templates from DB via the Settings module.
 */
class TemplateEngine {
  constructor() {
    /** @type {Map<string, { subject: string, body: string }>} */
    this.templates = new Map();
  }

  /**
   * Register a reusable template.
   * @param {string} templateId 
   * @param {Object} template - { subject, body }
   */
  register(templateId, template) {
    this.templates.set(templateId, template);
  }

  /**
   * Render a template with data.
   * @param {string} templateId
   * @param {Object} data - Key-value pairs to interpolate.
   * @returns {Object} { subject, body }
   */
  render(templateId, data = {}) {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Notification template '${templateId}' not found.`);
    }

    return {
      subject: this._interpolate(template.subject, data),
      body: this._interpolate(template.body, data),
    };
  }

  /**
   * Replace {{key}} placeholders with data values.
   * @private
   */
  _interpolate(text, data) {
    if (!text) return '';
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }
}

// ─── Default Templates ─────────────────────────────────────
const templateEngine = new TemplateEngine();

templateEngine.register('welcome', {
  subject: 'Welcome to Exam Bank, {{firstName}}!',
  body: '<h1>Welcome, {{firstName}} {{lastName}}</h1><p>Your account has been created successfully.</p>',
});

templateEngine.register('exam_result', {
  subject: 'Your Exam Results: {{examTitle}}',
  body: '<h1>Exam: {{examTitle}}</h1><p>Score: {{score}} / {{totalPoints}}</p><p>Status: {{status}}</p>',
});

templateEngine.register('password_reset', {
  subject: 'Password Reset Request',
  body: '<p>Click <a href="{{resetUrl}}">here</a> to reset your password. This link expires in {{expiryMinutes}} minutes.</p>',
});

templateEngine.register('exam_reminder', {
  subject: 'Reminder: {{examTitle}} starts soon',
  body: '<p>Your scheduled exam "{{examTitle}}" starts at {{startTime}}. Be prepared!</p>',
});

module.exports = templateEngine;
