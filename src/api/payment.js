import axios from "./axios.js"

export const createPayment = payment => axios.post('/payments', payment);
export const getPaymentBySaleId = (id) => axios.get(`/payments/${id}`);
export const getPayments = () => axios.get('/payments');
export const getSumPaymentsByPaymentMethod = (paymentMethod) => axios.get(`/payments/sum/${paymentMethod}`);
export const getPaymentByCustomerId = (customerId) => axios.get(`/payments/customer/${customerId}`);