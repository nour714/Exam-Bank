const billingRepository = require('./billing.repository');
const { eventBus } = require('../../shared/events');
const { paymentService } = require('../../shared/platforms');
const { configProvider } = require('../../shared/config');

class BillingService {
  /**
   * Syncs a subscription update from a payment provider webhook (e.g., Stripe, Paddle).
   * Relies on the paymentService to verify and normalize the payload.
   */
  async handleWebhookEvent(rawBody, signature) {
    const secret = configProvider.get('PAYMENT_WEBHOOK_SECRET');
    const event = paymentService.verifyWebhook(rawBody, signature, secret);

    const { type, data } = event;

    if (type === 'subscription.updated' || type === 'subscription.created') {
      await billingRepository.upsertSubscription(data.tenantId, {
        planId: data.planId,
        stripeSubscriptionId: data.subscriptionId, // In production, rename this DB field to paymentSubscriptionId
        stripeCustomerId: data.customerId,
        status: data.status,
        currentPeriodEnd: data.currentPeriodEnd,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
      });

      eventBus.publish('billing:subscription_updated', { tenantId: data.tenantId, status: data.status });
    } else if (type === 'subscription.deleted') {
      await billingRepository.cancelSubscription(data.tenantId, false);
      eventBus.publish('billing:subscription_canceled', { tenantId: data.tenantId });
    }
  }

  async getTenantSubscription(tenantId) {
    return billingRepository.getTenantSubscription(tenantId);
  }

  async getAvailablePlans() {
    return billingRepository.getPlans();
  }
}

module.exports = new BillingService();
