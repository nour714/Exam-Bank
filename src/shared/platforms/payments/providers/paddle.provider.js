const PaymentProvider = require('./payment.provider');

class PaddleProvider extends PaymentProvider {
  constructor(config) {
    super();
    this.vendorId = config.vendorId;
    this.apiKey = config.apiKey;
  }

  async createCheckoutSession(data) {
    return {
      sessionId: 'paddle_dummy',
      checkoutUrl: 'https://checkout.paddle.com/dummy',
    };
  }

  async cancelSubscription(subscriptionId) {
    return true;
  }

  verifyWebhook(rawBody, signature, secret) {
    return {
      type: 'subscription.updated',
      rawType: 'subscription_updated',
      data: { tenantId: 'dummy', subscriptionId: 'sub_pad_123', status: 'active' },
    };
  }
}

module.exports = PaddleProvider;
