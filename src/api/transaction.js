import axios from "./axios.js";

export const getTransactions = (paramsOrConfig, maybeConfig) => {
    if (paramsOrConfig && (paramsOrConfig.signal || paramsOrConfig.headers) && !paramsOrConfig.page && !paramsOrConfig.q && !paramsOrConfig.limit) {
        return axios.get("/transactions", { ...paramsOrConfig, params: { page: 1, limit: 50, ...(paramsOrConfig.params || {}) } });
    }
    const params = paramsOrConfig || {};
    const config = maybeConfig || {};
    return axios.get("/transactions", { ...config, params: { page: 1, limit: 50, ...params, ...(config.params || {}) } });
};

export const getTransactionById = (id, config) =>
    axios.get(`/transactions/${id}`, config);

export const getTransactionsSummary = (config) =>
    axios.get("/transactions/summary", config);

export const getCashAvailableDetail = (config) =>
    axios.get("/transactions/cash-detail", config);

export const createTransaction = (transaction) =>
    axios.post("/transactions", transaction);
