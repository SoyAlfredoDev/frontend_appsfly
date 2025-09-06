import axios from "./axios.js"

export const getProducts = () => axios.get('/products');
export const createProducts = (data) => axios.post('/products', data);
export const getProductById = (id) => axios.get(`/products/${id}`);
