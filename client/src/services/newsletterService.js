import api from './api';

export const subscribeNewsletter = (email) =>
  api.post('/newsletter/subscribe', {
    email,
    consent: true,
    source: 'public-footer',
  });
