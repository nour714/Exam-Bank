const PaymentProvider = require('./payment.provider');

class PayPalProvider extends PaymentProvider {
  constructor(config) {
    super();
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
  }

  async createCheckoutSession(data) {
    return {
      sessionId: 'pp_test_dummy',
      checkoutUrl: 'https://paypal.com/checkoutnow?token=pp_test_dummy',
    };
  }

  async cancelSubscription(subscriptionId) {
    return true;
  }

  verifyWebhook(rawBody, signature, secret) {
    return {
      type: 'subscription.updated',
      rawType: 'BILLING.SUBSCRIPTION.UPDATED',
      data: { tenantId: 'dummy', subscriptionId: 'sub_pp_123', status: 'active' },
    };
  }
}

module.exports = PayPalProvider;
