import api from './api';

export const createReview = (data) => api.post('/reviews', data);
export const getBoatReviews = (boatId) => api.get(`/boats/${boatId}/reviews`);
