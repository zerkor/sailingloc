import api from './api';

export const createStripeCheckoutSession = (bookingId) =>
  api.post('/payments/stripe/create-checkout-session', { bookingId });
