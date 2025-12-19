import axios from "./axios.js"

export const createProvider = provider => axios.post('/providers', provider);
export const getProviders = () => axios.get('/providers');
export const getProviderById = id => axios.get(`/providers/${id}`);
export const updateProvider = (id, provider) => axios.put(`/providers/${id}`, provider);
export const deleteProviderById = id => axios.delete(`/providers/${id}`);
