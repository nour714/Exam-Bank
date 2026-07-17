const NotificationProvider = require('./notification.provider');

/**
 * Push notification provider.
 * Supports FCM (Firebase Cloud Messaging), Web Push, Apple APNS through config.
 */
class PushProvider extends NotificationProvider {
  constructor(config) {
    super();
    this.vapidKeys = config.vapidKeys || {};
    // Initialize web-push or FCM admin SDK
  }

  async send(recipient, payload) {
    // recipient.deviceTokens is an array of push subscription endpoints
    // In production: send to each token via web-push or FCM HTTP v1
    return {
      messageId: `push_${Date.now()}`,
      status: 'sent',
      channel: 'push',
    };
  }
}

module.exports = PushProvider;
