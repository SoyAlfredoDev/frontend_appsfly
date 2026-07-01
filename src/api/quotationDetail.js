import axios from "./axios.js";

export const getQuotationDetailsByQuotationId = (id) => axios.get(`/quotationDetails/${id}`);
export const createQuotationDetail = (data) => axios.post('/quotationDetails', data);
