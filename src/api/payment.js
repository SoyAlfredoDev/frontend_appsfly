import axios from "./axios.js"

export const createPayment = payment => axios.post('/payments', payment);
export const getPaymentBySaleId = (id) => axios.get(`/payments/${id}`);