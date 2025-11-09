import axios from "./axios.js"

export const createTransaction = transaction => axios.post('/transactions', transaction);
export const getTransactions = () => axios.get('/transactions');