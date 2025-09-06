import axios from "./axios.js"

export const getServices = () => axios.get('/services');
export const createServices = (data) => axios.post('/services', data);
export const getServiceById = (id) => axios.get(`/services/${id}`);