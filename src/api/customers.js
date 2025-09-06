import axios from "./axios.js"

export const createCustomer = customer => axios.post('/customers', customer);
export const getCustomers = () => axios.get('/customers');
export const getCustomerById = id => axios.get(`/customers/${id}`);
export const updateCustomer = (id, customer) => axios.put(`/customers/${id}`, customer);