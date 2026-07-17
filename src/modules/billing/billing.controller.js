const billingService = require('./billing.service');

class BillingController {
  async getSubscription(req, res) {
    const sub = await billingService.getTenantSubscription(req.tenantId);
    res.status(200).json({ success: true, data: sub });
  }

  async getPlans(req, res) {
    const plans = await billingService.getAvailablePlans();
    res.status(200).json({ success: true, data: plans });
  }

  async handlePaymentWebhook(req, res) {
    // Expected to receive raw body for signature verification
    const rawBody = req.body; 
    const signature = req.headers['stripe-signature'] || req.headers['x-paddle-signature'] || req.headers['x-signature'];
    
    await billingService.handleWebhookEvent(rawBody, signature);
    res.status(200).json({ received: true });
  }
}

module.exports = new BillingController();
