const PaymentProvider = require('./payment.provider');

class StripeProvider extends PaymentProvider {
  constructor(config) {
    super();
    this.apiKey = config.apiKey;
    // this.stripe = require('stripe')(this.apiKey);
  }

  async createCheckoutSession(data) {
    // const session = await this.stripe.checkout.sessions.create({ ... });
    return {
      sessionId: 'cs_test_dummy_stripe',
      checkoutUrl: 'https://checkout.stripe.com/pay/cs_test_dummy',
    };
  }

  async cancelSubscription(subscriptionId) {
    // await this.stripe.subscriptions.cancel(subscriptionId);
    return true;
  }

  verifyWebhook(rawBody, signature, secret) {
    // const event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    // Dummy normalization
    return {
      type: 'subscription.updated', // Normalized
      rawType: 'customer.subscription.updated',
      data: { tenantId: 'dummy', subscriptionId: 'sub_123', status: 'active' },
    };
  }
}

module.exports = StripeProvider;
