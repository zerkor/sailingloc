import api from './api';

export const createBooking = (data) => api.post('/bookings', data);
export const getTenantBookings = () => api.get('/bookings/me');
export const getOwnerBookings = () => api.get('/bookings/owner');
export const acceptBooking = (id) => api.patch(`/bookings/${id}/accept`);
export const rejectBooking = (id) => api.patch(`/bookings/${id}/reject`);
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`);
export const payBooking = (id) => api.patch(`/bookings/${id}/pay`);
export const completeBooking = (id) => api.patch(`/bookings/${id}/complete`);
