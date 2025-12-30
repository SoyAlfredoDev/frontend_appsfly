import axios from "./axios.js"

export const getProducts = () => axios.get('/products');
export const createProducts = (data) => axios.post('/products', data);
export const getProductById = (id) => axios.get(`/products/${id}`);
export const getProductWithAnalyticsRequest = (id, page = 1) => axios.get(`/products/${id}/view?page=${page}&limit=10`);
