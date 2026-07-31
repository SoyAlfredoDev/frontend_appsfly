import axios from "./axios.js"

export const getProducts = (paramsOrConfig, maybeConfig) => {
    if (paramsOrConfig && (paramsOrConfig.signal || paramsOrConfig.headers) && !paramsOrConfig.page && !paramsOrConfig.q && !paramsOrConfig.limit) {
        return axios.get('/products', { ...paramsOrConfig, params: { page: 1, limit: 200, ...(paramsOrConfig.params || {}) } });
    }
    const params = paramsOrConfig || {};
    const config = maybeConfig || {};
    return axios.get('/products', { ...config, params: { page: 1, limit: 50, ...params, ...(config.params || {}) } });
};
export const createProducts = (data) => axios.post('/products', data);
export const updateProducts = (id, data) => axios.put(`/products/${id}`, data);
export const getProductById = (id) => axios.get(`/products/${id}`);
export const getProductWithAnalyticsRequest = (id, page = 1) => axios.get(`/products/${id}/view?page=${page}&limit=10`);
