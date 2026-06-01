import api from './api';

export const getBoats = (params) => api.get('/boats', { params });
export const getBoatById = (id) => api.get(`/boats/${id}`);
export const createBoat = (data) => api.post('/boats', data);
export const updateBoat = (id, data) => api.put(`/boats/${id}`, data);
export const deleteBoat = (id) => api.delete(`/boats/${id}`);
export const getOwnerBoats = () => api.get('/boats/owner/my-boats');
export const getBoatReviews = (id) => api.get(`/boats/${id}/reviews`);
