import api from './api';

export const sendAdminTestEmail = (to) => api.post('/admin/email/test', { to }, { timeout: 20000 });

export const sendAdminNewsletter = (payload) => api.post('/admin/email/newsletter', payload, { timeout: 60000 });
