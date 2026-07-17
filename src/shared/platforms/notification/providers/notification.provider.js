/**
 * @abstract NotificationProvider
 * Base class for all notification channel providers (Email, SMS, Push, In-App).
 */
class NotificationProvider {
  /**
   * Send a notification through this channel.
   * @param {Object} recipient - { userId, email, phone, deviceTokens }
   * @param {Object} payload   - { subject, body, templateId, templateData, metadata }
   * @returns {Promise<Object>} { messageId, status, channel }
   */
  async send(recipient, payload) {
    throw new Error('Method not implemented.');
  }

  /**
   * Send a batch of notifications.
   * @param {Object[]} notifications - Array of { recipient, payload }
   * @returns {Promise<Object[]>}
   */
  async sendBatch(notifications) {
    return Promise.all(notifications.map(n => this.send(n.recipient, n.payload)));
  }
}

module.exports = NotificationProvider;
