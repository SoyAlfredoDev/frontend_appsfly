import axios from "./axios.js"
export const getSales = () => axios.get('/sales');
export const createSale = (data) => axios.post('/sales', data);
export const getSaleById = (id) => axios.get(`/sales/${id}`);
export const getMonthlySales = (month, year) => axios.get(`/sales/${month}/${year}`);
export const getDaySales = (day, month, year) => axios.get(`/sales/${day}/${month}/${year}`);
