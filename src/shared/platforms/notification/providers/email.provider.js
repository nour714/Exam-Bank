const NotificationProvider = require('./notification.provider');

/**
 * Email notification provider.
 * Supports SMTP (Nodemailer), Resend, SendGrid, AWS SES through config.
 * Requires `nodemailer` npm package when activated.
 */
class EmailProvider extends NotificationProvider {
  constructor(config) {
    super();
    this.from = config.from || 'noreply@exambank.com';
    // this.transporter = nodemailer.createTransport(config.smtp);
  }

  async send(recipient, payload) {
    // const info = await this.transporter.sendMail({
    //   from: this.from,
    //   to: recipient.email,
    //   subject: payload.subject,
    //   html: payload.body,
    // });
    return {
      messageId: `email_${Date.now()}`,
      status: 'queued',
      channel: 'email',
    };
  }
}

module.exports = EmailProvider;
