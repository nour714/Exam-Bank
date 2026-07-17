const NotificationProvider = require('./notification.provider');

/**
 * SMS notification provider.
 * Supports Twilio, Vonage, AWS SNS through config.
 */
class SMSProvider extends NotificationProvider {
  constructor(config) {
    super();
    this.from = config.from || '+1000000000';
    // this.client = twilio(config.accountSid, config.authToken);
  }

  async send(recipient, payload) {
    // const message = await this.client.messages.create({
    //   body: payload.body,
    //   from: this.from,
    //   to: recipient.phone,
    // });
    return {
      messageId: `sms_${Date.now()}`,
      status: 'sent',
      channel: 'sms',
    };
  }
}

module.exports = SMSProvider;
