const InAppProvider = require('./providers/inapp.provider');
const EmailProvider = require('./providers/email.provider');
const PushProvider = require('./providers/push.provider');
const SMSProvider = require('./providers/sms.provider');
const templateEngine = require('./template.engine');
const { eventBus } = require('../../events');

/**
 * Unified Notification Service.
 *
 * Business modules call:
 *   notificationService.send('email', recipient, { templateId: 'welcome', data: { ... } })
 *
 * The service resolves the template, selects the channel provider, dispatches the
 * notification, and publishes delivery tracking events.
 */
class NotificationService {
  constructor() {
    /** @type {Map<string, NotificationProvider>} */
    this.channels = new Map();
  }

  /**
   * Register a notification channel (email, sms, push, in_app).
   */
  registerChannel(channelName, providerInstance) {
    this.channels.set(channelName, providerInstance);
  }

  /**
   * Get a channel provider by name.
   */
  getChannel(channelName) {
    const channel = this.channels.get(channelName);
    if (!channel) {
      throw new Error(`Notification channel '${channelName}' is not registered.`);
    }
    return channel;
  }

  /**
   * Send a notification through one or more channels.
   * @param {string|string[]} channels - 'email' | ['email', 'in_app']
   * @param {Object} recipient - { userId, email, phone, deviceTokens }
   * @param {Object} payload - { templateId, data } OR { subject, body }
   * @returns {Promise<Object[]>} Array of delivery results per channel.
   */
  async send(channels, recipient, payload) {
    const channelList = Array.isArray(channels) ? channels : [channels];

    // Resolve template if templateId is provided
    let resolvedPayload = payload;
    if (payload.templateId) {
      resolvedPayload = {
        ...payload,
        ...templateEngine.render(payload.templateId, payload.data || {}),
      };
    }

    const results = await Promise.allSettled(
      channelList.map(async (channelName) => {
        const provider = this.getChannel(channelName);
        const result = await provider.send(recipient, resolvedPayload);

        eventBus.publish('notification:sent', {
          channel: channelName,
          recipient: recipient.userId || recipient.email,
          messageId: result.messageId,
          status: result.status,
        });

        return result;
      })
    );

    // Track any failures
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      eventBus.publish('notification:delivery_failed', {
        failures: failures.map(f => f.reason?.message),
        recipient: recipient.userId || recipient.email,
      });
    }

    return results.map(r => r.status === 'fulfilled' ? r.value : { status: 'failed', error: r.reason?.message });
  }

  /**
   * Send a notification to multiple recipients (fan-out).
   */
  async sendBulk(channels, recipients, payload) {
    return Promise.all(
      recipients.map(recipient => this.send(channels, recipient, payload))
    );
  }
}

const { configProvider } = require('../../config');

// ─── Singleton + Config-driven channel registration ────────
const notificationService = new NotificationService();

// In-App is always available
notificationService.registerChannel('in_app', new InAppProvider());

// Email — register if SMTP config is present
const smtpHost = configProvider.get('SMTP_HOST');
if (smtpHost) {
  notificationService.registerChannel('email', new EmailProvider({
    from: configProvider.get('SMTP_FROM'),
    smtp: {
      host: smtpHost,
      port: configProvider.getInt('SMTP_PORT', 587),
      auth: { 
        user: configProvider.get('SMTP_USER'), 
        pass: configProvider.get('SMTP_PASS') 
      },
    },
  }));
} else {
  // Register a dummy email provider for dev
  notificationService.registerChannel('email', new EmailProvider({ from: 'dev@exambank.local' }));
}

// Push — register if VAPID keys exist
const vapidPublicKey = configProvider.get('VAPID_PUBLIC_KEY');
if (vapidPublicKey) {
  notificationService.registerChannel('push', new PushProvider({
    vapidKeys: {
      publicKey: vapidPublicKey,
      privateKey: configProvider.get('VAPID_PRIVATE_KEY'),
    },
  }));
}

// SMS — register if Twilio/Vonage config exists
const smsAccountSid = configProvider.get('SMS_ACCOUNT_SID');
if (smsAccountSid) {
  notificationService.registerChannel('sms', new SMSProvider({
    accountSid: smsAccountSid,
    authToken: configProvider.get('SMS_AUTH_TOKEN'),
    from: configProvider.get('SMS_FROM_NUMBER'),
  }));
}

module.exports = notificationService;
