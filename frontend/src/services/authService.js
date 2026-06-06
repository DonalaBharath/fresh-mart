import api from '../api/api';

export const sendOtp = (formData) => api.post('/auth/register', formData);
export const verifyOtp = (payload) => api.post('/auth/verify-otp', payload);
export const resendOtp = (payload) => api.post('/auth/resend-otp', payload);
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const refreshToken = () => api.post('/auth/refresh-token');
export const logoutUser = () => api.post('/auth/logout');
export const fetchCsrfToken = () => api.get('/auth/csrf-token');
