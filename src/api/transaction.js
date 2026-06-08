import axios from "./axios.js";

export const getTransactions = (config) => axios.get("/transactions", config);

export const getTransactionById = (id, config) =>
    axios.get(`/transactions/${id}`, config);

export const getTransactionsSummary = (config) =>
    axios.get("/transactions/summary", config);

export const createTransaction = (transaction) =>
    axios.post("/transactions", transaction);
