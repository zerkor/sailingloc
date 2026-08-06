import api from './api';

export const subscribeNewsletter = ({ email, captchaA, captchaB, captchaAnswer, website = '' }) =>
  api.post('/newsletter/subscribe', {
    email,
    consent: true,
    captchaA,
    captchaB,
    captchaAnswer,
    website,
    source: 'public-footer',
  });
