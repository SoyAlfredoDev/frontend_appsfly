import axios from "./axios.js";

export const getQuotations = () => axios.get('/quotations');
export const createQuotation = (data) => axios.post('/quotations', data);
export const getQuotationById = (id) => axios.get(`/quotations/${id}`);
export const updateQuotationStatus = (id, status) => axios.patch(`/quotations/${id}/status`, { status });
export const sendQuotationEmail = (id) => axios.post(`/quotations/${id}/send-email`);
export const deleteQuotation = (id) => axios.delete(`/quotations/${id}`);
