import axios from "./axios.js"

export const getSaleDetails = () => axios.get('/saleDetails');
export const getSaleDetailById = (id) => axios.get(`/saleDetails/${id}`);
export const createSaleDetail = (data) => axios.post('/saleDetails', data);