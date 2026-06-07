import axios from './axios';

export const getAdminKpis = () => axios.get('/admin/kpis');
export const getAdminSubscriptions = () => axios.get('/admin/subscriptions');
export const getAdminBusinesses = () => axios.get('/admin/businesses');
export const getAdminBusinessById = (id) => axios.get(`/admin/businesses/${id}`);
export const getAdminUsers = () => axios.get('/admin/users');
