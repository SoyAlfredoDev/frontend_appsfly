import axios from './axios';

export const getAdminKpis = () => axios.get('/admin/kpis');
export const getAdminSubscriptions = () => axios.get('/admin/subscriptions');
export const getAdminBusinesses = () => axios.get('/admin/businesses');
export const getAdminBusinessById = (id) => axios.get(`/admin/businesses/${id}`);
export const assignAdminBusinessPlan = (id, planId) =>
    axios.post(`/admin/businesses/${id}/subscription`, { planId });
export const recordAdminBusinessLinkPayment = (id) =>
    axios.post(`/admin/businesses/${id}/subscription/link-payment`);
export const getAdminUsers = () => axios.get('/admin/users');
