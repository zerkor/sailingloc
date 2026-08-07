const Stripe = require('stripe');

const truthy = (value) => ['true', '1', 'yes', 'on'].includes(String(value || '').toLowerCase());
const sanitizeUrlEnv = (value, fallback) => {
  const firstValue = String(value || '')
    .split(/\s+/)
    .find((part) => /^https?:\/\//i.test(part));

  try {
    return new URL(firstValue || fallback).origin;
  } catch {
    return fallback;
  }
};

const stripeConfig = {
  enabled: truthy(process.env.STRIPE_ENABLED),
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  currency: (process.env.STRIPE_CURRENCY || 'eur').toLowerCase(),
  paymentMode: process.env.PAYMENT_MODE || 'simulated',
  clientUrl: sanitizeUrlEnv(process.env.CLIENT_URL || process.env.FRONTEND_URL, 'http://localhost:5173'),
  serverUrl: sanitizeUrlEnv(process.env.SERVER_URL, 'http://localhost:5000'),
};

const isStripeEnabled = () => Boolean(stripeConfig.enabled && stripeConfig.secretKey);

const stripe = isStripeEnabled() ? new Stripe(stripeConfig.secretKey) : null;

module.exports = { stripe, stripeConfig, isStripeEnabled };
