const Stripe = require('stripe');

const truthy = (value) => ['true', '1', 'yes', 'on'].includes(String(value || '').toLowerCase());

const stripeConfig = {
  enabled: truthy(process.env.STRIPE_ENABLED),
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  currency: (process.env.STRIPE_CURRENCY || 'eur').toLowerCase(),
  paymentMode: process.env.PAYMENT_MODE || 'simulated',
  clientUrl: (process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, ''),
  serverUrl: (process.env.SERVER_URL || 'http://localhost:5000').replace(/\/$/, ''),
};

const isStripeEnabled = () => Boolean(stripeConfig.enabled && stripeConfig.secretKey);

const stripe = isStripeEnabled() ? new Stripe(stripeConfig.secretKey) : null;

module.exports = { stripe, stripeConfig, isStripeEnabled };
