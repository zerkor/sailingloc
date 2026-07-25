import api from './api';

export const sendAdminTestEmail = (to) => api.post('/admin/email/test', { to }, { timeout: 20000 });
