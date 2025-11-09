import axios from "./axios.js"

export const createExpense = (data) => axios.post('/expenses', data);
export const getExpenseById = (id) => axios.get(`/expenses/${id}`);
export const getExpenses = () => axios.get('/expenses');
export const deleteExpense = (id) => axios.delete(`/expenses/delete/${id}`);
export const getSumExpensesByPaymentMethod = (paymentMethod) => axios.get(`/expenses/sum/${paymentMethod}`);
