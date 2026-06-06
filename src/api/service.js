import axios from "./axios.js"

export const getServices = (config) => axios.get('/services', config);
export const createServices = (data) => axios.post('/services', data);
export const getServiceById = (id) => axios.get(`/services/${id}`);