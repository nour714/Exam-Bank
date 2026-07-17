const PaymentProvider = require('./payment.provider');

class LemonSqueezyProvider extends PaymentProvider {
  constructor(config) {
    super();
    this.apiKey = config.apiKey;
    this.storeId = config.storeId;
  }

  async createCheckoutSession(data) {
    return {
      sessionId: 'ls_dummy',
      checkoutUrl: 'https://lemonsqueezy.com/checkout/dummy',
    };
  }

  async cancelSubscription(subscriptionId) {
    return true;
  }

  verifyWebhook(rawBody, signature, secret) {
    return {
      type: 'subscription.updated',
      rawType: 'subscription_updated',
      data: { tenantId: 'dummy', subscriptionId: 'sub_ls_123', status: 'active' },
    };
  }
}

module.exports = LemonSqueezyProvider;
