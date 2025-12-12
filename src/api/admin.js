import axios from './axios';

export const getAdminKpis = () => axios.get('/admin/kpis');
