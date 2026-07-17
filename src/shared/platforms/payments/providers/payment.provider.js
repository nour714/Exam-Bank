class PaymentProvider {
  /**
   * Create a checkout session or payment intent.
   * @param {Object} data - { tenantId, planId, amount, currency, successUrl, cancelUrl }
   * @returns {Promise<Object>} { sessionId, checkoutUrl }
   */
  async createCheckoutSession(data) {
    throw new Error('Method not implemented.');
  }

  /**
   * Cancel an active subscription.
   * @param {string} subscriptionId
   * @returns {Promise<boolean>} success
   */
  async cancelSubscription(subscriptionId) {
    throw new Error('Method not implemented.');
  }

  /**
   * Verify an incoming webhook signature and parse the payload.
   * @param {string} rawBody
   * @param {string} signature
   * @param {string} secret
   * @returns {Object} normalized event object { type, data }
   */
  verifyWebhook(rawBody, signature, secret) {
    throw new Error('Method not implemented.');
  }
}

module.exports = PaymentProvider;
