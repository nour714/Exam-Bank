const StripeProvider = require('./providers/stripe.provider');
const PayPalProvider = require('./providers/paypal.provider');
const PaddleProvider = require('./providers/paddle.provider');
const LemonSqueezyProvider = require('./providers/lemonsqueezy.provider');
const { configProvider } = require('../../config');
const { eventBus } = require('../../events');

class PaymentService {
  constructor() {
    this.providers = new Map();
    this.defaultProvider = null;
  }

  registerProvider(name, providerInstance, isDefault = false) {
    this.providers.set(name, providerInstance);
    if (isDefault || !this.defaultProvider) {
      this.defaultProvider = name;
    }
  }

  getProvider(name) {
    const providerName = name || this.defaultProvider;
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Payment Provider '${providerName}' is not registered.`);
    }
    return provider;
  }

  async createCheckoutSession(data, options = {}) {
    const provider = this.getProvider(options.provider);
    const session = await provider.createCheckoutSession(data);
    eventBus.publish('payment:checkout_created', { tenantId: data.tenantId, provider: this.defaultProvider });
    return session;
  }

  async cancelSubscription(subscriptionId, options = {}) {
    const provider = this.getProvider(options.provider);
    return provider.cancelSubscription(subscriptionId);
  }

  verifyWebhook(rawBody, signature, secret, options = {}) {
    const provider = this.getProvider(options.provider);
    return provider.verifyWebhook(rawBody, signature, secret);
  }
}

// ─── Config-driven instantiation ───────────────────────────
const paymentService = new PaymentService();

const defaultPaymentProvider = configProvider.get('PAYMENT_DEFAULT_PROVIDER', 'stripe');

const providerConfigs = [
  { name: 'stripe', key: 'STRIPE_API_KEY', Provider: StripeProvider },
  { name: 'paypal', key: 'PAYPAL_CLIENT_ID', Provider: PayPalProvider },
  { name: 'paddle', key: 'PADDLE_API_KEY', Provider: PaddleProvider },
  { name: 'lemonsqueezy', key: 'LEMONSQUEEZY_API_KEY', Provider: LemonSqueezyProvider },
];

for (const { name, key, Provider } of providerConfigs) {
  const apiKey = configProvider.get(key);
  if (apiKey) {
    paymentService.registerProvider(
      name,
      new Provider({ apiKey, clientId: apiKey }), // naive mapping for demo
      name === defaultPaymentProvider
    );
  }
}

// Fallback for dev if nothing is configured
if (paymentService.providers.size === 0) {
  paymentService.registerProvider('stripe', new StripeProvider({ apiKey: 'dummy' }), true);
}

module.exports = paymentService;
