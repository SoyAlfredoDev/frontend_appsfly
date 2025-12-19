import axios from "./axios.js"

export const getPurchases = () => axios.get('/purchases');
export const createPurchase = (data) => axios.post('/purchases', data);
export const getPurchaseById = (id) => axios.get(`/purchases/${id}`);
export const getMonthlyPurchases = (month, year) => axios.get(`/purchases/month/${month}/${year}`);
export const getMonthlyPurchasesNow = () => axios.get('/purchases/monthNow');
export const getDayPurchases = (day, month, year) => axios.get(`/purchases/day/${day}/${month}/${year}`);
export const getPurchasesByProviderIdRequest = (providerId) => axios.get(`/purchases/provider/${providerId}`);
export const countPurchasesMonthRequest = (month, year) => axios.get(`/purchases/count/${month}/${year}`);
