const NotificationProvider = require('./notification.provider');

/**
 * In-App notification provider.
 * Stores notifications in the database for in-app inbox / bell icon display.
 * In a real implementation this would write to a Prisma model and optionally
 * push via WebSocket.
 */
class InAppProvider extends NotificationProvider {
  async send(recipient, payload) {
    // In production: prisma.notification.create({ data: { userId, title, body, metadata } })
    // Then: eventBus.publish('notification:inapp', { userId: recipient.userId, ... })
    return {
      messageId: `inapp_${Date.now()}`,
      status: 'delivered',
      channel: 'in_app',
    };
  }
}

module.exports = InAppProvider;
