import axios from "./axios.js"

export const createBusiness = (data) => axios.post('/business', data);
export const getBusiness = () => axios.get('/business');
export const getBusinessByIdRequest = (id) => axios.get(`/business/${id}`);
export const countBusinessRequest = () => axios.get('/business/count')