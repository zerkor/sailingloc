import api from './api';

export const subscribeNewsletter = ({ email, captchaA, captchaB, captchaAnswer, turnstileToken, website = '' }) =>
  api.post('/newsletter/subscribe', {
    email,
    consent: true,
    captchaA,
    captchaB,
    captchaAnswer,
    turnstileToken,
    website,
    source: 'public-footer',
  });
