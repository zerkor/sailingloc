import api from './api';

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => api.post(`/auth/reset-password/${token}`, { password });
export const exportMyData = () => api.get('/auth/me/export');
export const anonymizeMyAccount = () => api.delete('/auth/me/anonymize');
export const updateProfile = (data) => api.put('/users/me', data);
export const deleteAccount = () => api.delete('/users/me');
