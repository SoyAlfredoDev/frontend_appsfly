import axios from "./axios.js"

export const createCustomer = customer => axios.post('/customers', customer);
export const getCustomers = (paramsOrConfig, maybeConfig) => {
    // Compat: getCustomers({ signal }) o getCustomers({ page, q }, { signal })
    if (paramsOrConfig && (paramsOrConfig.signal || paramsOrConfig.headers) && !paramsOrConfig.page && !paramsOrConfig.q && !paramsOrConfig.limit) {
        return axios.get('/customers', { ...paramsOrConfig, params: { page: 1, limit: 200, ...(paramsOrConfig.params || {}) } });
    }
    const params = paramsOrConfig || {};
    const config = maybeConfig || {};
    return axios.get('/customers', { ...config, params: { page: 1, limit: 50, ...params, ...(config.params || {}) } });
};
export const getCustomerById = id => axios.get(`/customers/${id}`);
export const updateCustomer = (id, customer) => axios.put(`/customers/${id}`, customer);
export const deleteCustomerById = id => axios.delete(`/customers/${id}`);
