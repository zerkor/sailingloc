import api from './api';

export const createDocument = (data) => api.post('/documents', data);
export const getMyDocuments = () => api.get('/documents/me');
export const getAdminDocuments = (params) => api.get('/documents/admin', { params });
export const reviewDocument = (id, data) => api.patch(`/documents/${id}/review`, data);
